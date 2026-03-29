const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { randomBytes } = require('crypto');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { requireAdmin, requirePermission } = require('../middleware/auth');
const { AppError } = require('../middleware/error');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/gallery'),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '') || '.jpg';
    cb(null, `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
    cb(new AppError('Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.', 400));
  },
});

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: { postedBy: { select: { id: true, name: true } } },
    });
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/', requireAdmin, requirePermission('gallery:manage', 'students:manage', 'teachers:manage'), upload.single('image'), async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
    }).parse(req.body);

    if (!req.file) return res.status(400).json({ error: 'Imagem obrigatória' });

    const item = await prisma.galleryItem.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        imageUrl: `/uploads/gallery/${req.file.filename}`,
        postedById: req.user.id,
      },
      include: { postedBy: { select: { id: true, name: true } } },
    });

    res.status(201).json(item);
  } catch (err) { next(err); }
});

router.delete('/:id', requireAdmin, requirePermission('gallery:manage'), async (req, res, next) => {
  try {
    await prisma.galleryItem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Imagem removida' });
  } catch (err) { next(err); }
});

module.exports = router;

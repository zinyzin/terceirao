const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { requireAdmin, requirePermission } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/gallery'),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(items);
  } catch (err) { next(err); }
});

router.post('/', requireAdmin, requirePermission('gallery:manage', 'students:manage', 'teachers:manage'), upload.single('image'), async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().optional(),
      category: z.string().optional(),
    }).parse(req.body);

    if (!req.file) return res.status(400).json({ error: 'Imagem obrigatória' });

    const item = await prisma.galleryItem.create({
      data: {
        title: data.title,
        category: data.category,
        imageUrl: `/uploads/gallery/${req.file.filename}`,
      },
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

const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { requireAdmin, requirePermission, requireSuperadmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/teachers'),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const schema = z.object({
  name: z.string().min(2),
  subject: z.string().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  catchphrase: z.string().optional(),
  photoFromGallery: z.string().optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { isActive: true },
      orderBy: [{ isCounselor: 'desc' }, { name: 'asc' }],
    });
    res.json(teachers);
  } catch (err) { next(err); }
});

router.post('/', requireAdmin, requirePermission('teachers:manage'), upload.single('photo'), async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const teacher = await prisma.teacher.create({
      data: {
        ...data,
        photo: req.file ? `/uploads/teachers/${req.file.filename}` : (data.photoFromGallery || null),
      },
    });
    res.status(201).json(teacher);
  } catch (err) { next(err); }
});

router.put('/:id', requireAdmin, requirePermission('teachers:manage'), upload.single('photo'), async (req, res, next) => {
  try {
    const data = schema.partial().parse(req.body);
    const updated = await prisma.teacher.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(req.file ? { photo: `/uploads/teachers/${req.file.filename}` } : {}),
        ...(!req.file && data.photoFromGallery ? { photo: data.photoFromGallery } : {}),
      },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

router.patch('/:id/counselor', requireSuperadmin, async (req, res, next) => {
  try {
    await prisma.teacher.updateMany({ data: { isCounselor: false } });
    const updated = await prisma.teacher.update({
      where: { id: req.params.id },
      data: { isCounselor: true },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', requireAdmin, requirePermission('teachers:manage'), async (req, res, next) => {
  try {
    await prisma.teacher.update({ where: { id: req.params.id }, data: { isActive: false, isCounselor: false } });
    res.json({ message: 'Professor removido' });
  } catch (err) { next(err); }
});

module.exports = router;

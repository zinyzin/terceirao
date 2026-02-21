// src/routes/students.js
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { requireAdmin } = require('../middleware/auth');
const { AppError } = require('../middleware/error');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/students'),
  filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const schema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const students = await prisma.student.findMany({
      where: { isActive: true },
      include: {
        donations: { select: { amount: true } },
        raffleParticipants: { select: { tickets: true } },
        raffleWins: { select: { id: true } },
      },
      orderBy: { name: 'asc' },
    });

    const result = students.map(s => {
      const total = s.donations.reduce((acc, d) => acc + parseFloat(d.amount), 0);
      const tickets = s.raffleParticipants.reduce((acc, p) => acc + p.tickets, 0);
      return { ...s, totalDonated: total, totalTickets: tickets, wins: s.raffleWins.length };
    });

    const sorted = [...result].sort((a, b) => b.totalDonated - a.totalDonated);
    res.json(result.map(s => ({ ...s, rank: sorted.findIndex(x => x.id === s.id) + 1 })));
  } catch (err) { next(err); }
});

router.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const s = await prisma.student.findFirst({
      where: { id: req.params.id, isActive: true },
      include: {
        donations: { include: { contributor: true }, orderBy: { createdAt: 'desc' } },
        raffleParticipants: { include: { raffle: true } },
        ledgerEntries: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!s) throw new AppError('Aluno não encontrado', 404);
    res.json(s);
  } catch (err) { next(err); }
});

router.post('/', requireAdmin, upload.single('photo'), async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const student = await prisma.student.create({
      data: { ...data, photo: req.file ? `/uploads/students/${req.file.filename}` : null },
    });
    res.status(201).json(student);
  } catch (err) { next(err); }
});

router.put('/:id', requireAdmin, upload.single('photo'), async (req, res, next) => {
  try {
    const data = schema.partial().parse(req.body);
    const updated = await prisma.student.update({
      where: { id: req.params.id },
      data: { ...data, ...(req.file ? { photo: `/uploads/students/${req.file.filename}` } : {}) },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.student.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Aluno desativado' });
  } catch (err) { next(err); }
});

module.exports = router;

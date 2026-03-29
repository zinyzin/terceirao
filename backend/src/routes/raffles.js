// src/routes/raffles.js
const router = require('express').Router();
const crypto = require('crypto');
const { randomBytes } = crypto;
const multer = require('multer');
const path = require('path');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { requireAdmin, requirePermission } = require('../middleware/auth');
const { AppError } = require('../middleware/error');

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads/raffles'),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '') || '.jpg';
    cb(null, `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) return cb(null, true);
    cb(new AppError('Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.', 400));
  },
});

router.get('/', requirePermission('raffles:manage'), async (req, res, next) => {
  try {
    const raffles = await prisma.raffle.findMany({
      include: {
        participants: { include: { student: { select: { id: true, name: true, photo: true } } } },
        draw: { include: { winner: { select: { id: true, name: true, photo: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(raffles);
  } catch (err) { next(err); }
});

router.post('/', requirePermission('raffles:manage'), upload.single('prizeImage'), async (req, res, next) => {
  try {
    const data = z.object({
      title: z.string().min(2),
      description: z.string().optional(),
      drawDate: z.string().optional(),
    }).parse(req.body);

    const raffle = await prisma.raffle.create({
      data: {
        ...data,
        drawDate: data.drawDate ? new Date(data.drawDate) : null,
        prizeImage: req.file ? `/uploads/raffles/${req.file.filename}` : null,
      },
    });
    res.status(201).json(raffle);
  } catch (err) { next(err); }
});

router.post('/:id/participants', requirePermission('raffles:manage'), async (req, res, next) => {
  try {
    const { studentId, tickets = 1 } = z.object({
      studentId: z.string(),
      tickets: z.number().int().positive().default(1),
    }).parse(req.body);

    const raffle = await prisma.raffle.findUnique({ where: { id: req.params.id } });
    if (!raffle || raffle.status !== 'OPEN') throw new AppError('Rifa não encontrada ou fechada', 404);

    const p = await prisma.raffleParticipant.upsert({
      where: { raffleId_studentId: { raffleId: raffle.id, studentId } },
      update: { tickets: { increment: tickets } },
      create: { raffleId: raffle.id, studentId, tickets },
    });
    res.json(p);
  } catch (err) { next(err); }
});

// POST /api/raffles/:id/draw — Auditable, one-time
router.post('/:id/draw', requirePermission('raffles:manage'), async (req, res, next) => {
  try {
    const raffle = await prisma.raffle.findUnique({
      where: { id: req.params.id },
      include: { participants: true, draw: true },
    });
    if (!raffle) throw new AppError('Rifa não encontrada', 404);
    if (raffle.status !== 'OPEN') throw new AppError('Rifa já encerrada', 400);
    if (raffle.draw) throw new AppError('Sorteio já realizado', 400);
    if (!raffle.participants.length) throw new AppError('Sem participantes', 400);

    // Build weighted pool
    const pool = [];
    for (const p of raffle.participants) {
      for (let i = 0; i < p.tickets; i++) pool.push(p.studentId);
    }

    const seed = crypto.randomBytes(32).toString('hex');
    const idx = crypto.randomInt(0, pool.length);
    const winnerId = pool[idx];
    const hash = crypto.createHash('sha256').update(`${raffle.id}:${seed}:${idx}:${winnerId}`).digest('hex');

    const [draw] = await prisma.$transaction([
      prisma.raffleDraw.create({ data: { raffleId: raffle.id, winnerId, seed, hash }, include: { winner: true } }),
      prisma.raffle.update({ where: { id: raffle.id }, data: { status: 'CLOSED' } }),
    ]);

    await prisma.auditLog.create({
      data: { userId: req.user.id, action: 'RAFFLE_DRAW', module: 'Raffles', details: { raffleId: raffle.id, winnerId, hash }, ipAddress: req.ip, severity: 'CRITICAL' },
    });

    res.json({ draw, hash, seed });
  } catch (err) { next(err); }
});

router.patch('/:id/cancel', requirePermission('raffles:manage'), async (req, res, next) => {
  try {
    await prisma.raffle.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });
    res.json({ message: 'Rifa cancelada' });
  } catch (err) { next(err); }
});

router.delete('/:id', requirePermission('raffles:manage'), async (req, res, next) => {
  try {
    await prisma.raffleParticipant.deleteMany({ where: { raffleId: req.params.id } });
    await prisma.raffleDraw.deleteMany({ where: { raffleId: req.params.id } });
    await prisma.raffle.delete({ where: { id: req.params.id } });
    res.json({ message: 'Rifa excluída' });
  } catch (err) { next(err); }
});

module.exports = router;

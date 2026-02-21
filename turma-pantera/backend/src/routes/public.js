// src/routes/public.js — No authentication required
const router = require('express').Router();
const { prisma } = require('../lib/prisma');

// GET /api/public/info — site public data
router.get('/info', async (req, res, next) => {
  try {
    const [studentCount, totalRaised, settings] = await Promise.all([
      prisma.student.count({ where: { isActive: true } }),
      prisma.ledgerEntry.aggregate({
        where: { type: 'CREDIT' },
        _sum: { amount: true },
      }),
      prisma.siteSettings.findMany(),
    ]);

    const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

    res.json({
      studentCount,
      totalRaised: parseFloat(totalRaised._sum.amount || 0),
      siteName: settingsMap.siteName || 'Turma Pantera',
      siteDescription: settingsMap.siteDescription || 'Sistema de gestão do 3º Ano',
      year: settingsMap.year || new Date().getFullYear().toString(),
    });
  } catch (err) { next(err); }
});

// GET /api/public/students — public student listing (no financial data)
router.get('/students', async (req, res, next) => {
  try {
    const students = await prisma.student.findMany({
      where: { isActive: true },
      select: { id: true, name: true, photo: true, description: true },
      orderBy: { name: 'asc' },
    });
    res.json(students);
  } catch (err) { next(err); }
});

// GET /api/public/raffles — show open raffles publicly
router.get('/raffles', async (req, res, next) => {
  try {
    const raffles = await prisma.raffle.findMany({
      where: { status: 'OPEN' },
      select: {
        id: true, title: true, description: true, prizeImage: true, drawDate: true, status: true,
        _count: { select: { participants: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(raffles);
  } catch (err) { next(err); }
});

module.exports = router;

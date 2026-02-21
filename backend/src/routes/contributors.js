// src/routes/contributors.js
const router = require('express').Router();
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { requireAdmin } = require('../middleware/auth');
const { AppError } = require('../middleware/error');

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const list = await prisma.contributor.findMany({
      include: { donations: { select: { amount: true, createdAt: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(list.map(c => ({ ...c, total: c.donations.reduce((s, d) => s + parseFloat(d.amount), 0) })));
  } catch (err) { next(err); }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const data = z.object({ name: z.string().min(2), email: z.string().email().optional(), phone: z.string().optional() }).parse(req.body);
    const c = await prisma.contributor.create({ data });
    res.status(201).json(c);
  } catch (err) { next(err); }
});

router.post('/:id/donate', requireAdmin, async (req, res, next) => {
  try {
    const { amount, description } = z.object({ amount: z.number().positive(), description: z.string().optional() }).parse(req.body);
    const c = await prisma.contributor.findUnique({ where: { id: req.params.id } });
    if (!c) throw new AppError('Contribuidor não encontrado', 404);

    const donation = await prisma.donation.create({ data: { contributorId: c.id, amount, description } });

    let wallet = await prisma.wallet.findFirst();
    if (!wallet) wallet = await prisma.wallet.create({ data: {} });
    await prisma.ledgerEntry.create({
      data: { walletId: wallet.id, type: 'CREDIT', amount, description: `Doação de ${c.name}`, referenceId: donation.id, referenceType: 'DONATION' },
    });
    res.status(201).json(donation);
  } catch (err) { next(err); }
});

module.exports = router;

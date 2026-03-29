// src/routes/contributors.js
const router = require('express').Router();
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { requireAdmin, requirePermission } = require('../middleware/auth');
const { AppError } = require('../middleware/error');

router.get('/', requirePermission('contributors:manage'), async (req, res, next) => {
  try {
    const list = await prisma.contributor.findMany({
      include: { donations: { select: { amount: true, createdAt: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(list.map(c => ({ ...c, total: c.donations.reduce((s, d) => s + parseFloat(d.amount), 0) })));
  } catch (err) { next(err); }
});

router.post('/', requirePermission('contributors:manage'), async (req, res, next) => {
  try {
    const data = z.object({ name: z.string().min(2), email: z.string().email().optional(), phone: z.string().optional() }).parse(req.body);
    const c = await prisma.contributor.create({ data });
    res.status(201).json(c);
  } catch (err) { next(err); }
});

router.post('/:id/donate', requirePermission('contributors:manage'), async (req, res, next) => {
  try {
    const { amount, description } = z.object({ amount: z.number().positive(), description: z.string().optional() }).parse(req.body);
    const c = await prisma.contributor.findUnique({ where: { id: req.params.id } });
    if (!c) throw new AppError('Contribuidor não encontrado', 404);

    let wallet = await prisma.wallet.findFirst();
    if (!wallet) wallet = await prisma.wallet.create({ data: {} });

    const [donation] = await prisma.$transaction([
      prisma.donation.create({ data: { contributorId: c.id, amount, description } }),
      prisma.ledgerEntry.create({
        data: { walletId: wallet.id, type: 'CREDIT', amount, description: `Doação de ${c.name}`, referenceType: 'DONATION' },
      }),
    ]);
    res.status(201).json(donation);
  } catch (err) { next(err); }
});

router.delete('/:id', requirePermission('contributors:manage'), async (req, res, next) => {
  try {
    await prisma.donation.deleteMany({ where: { contributorId: req.params.id } });
    await prisma.contributor.delete({ where: { id: req.params.id } });
    res.json({ message: 'Contribuidor excluído' });
  } catch (err) { next(err); }
});

// PUT /api/contributors/:contributorId/donations/:donationId — edit donation
router.put('/:contributorId/donations/:donationId', requirePermission('contributors:manage'), async (req, res, next) => {
  try {
    const { amount, description } = z.object({ 
      amount: z.number().positive(), 
      description: z.string().optional() 
    }).parse(req.body);
    
    const donation = await prisma.donation.findUnique({ 
      where: { id: req.params.donationId },
      include: { contributor: true }
    });
    if (!donation) throw new AppError('Doação não encontrada', 404);
    
    const ledgerEntry = await prisma.ledgerEntry.findFirst({
      where: { referenceId: donation.id, referenceType: 'DONATION' }
    });

    const ops = [
      prisma.donation.update({ where: { id: req.params.donationId }, data: { amount, description } }),
    ];
    if (ledgerEntry) {
      ops.push(prisma.ledgerEntry.update({
        where: { id: ledgerEntry.id },
        data: {
          amount,
          description: `Doação de ${donation.contributor.name}${description ? ': ' + description : ''}`,
        },
      }));
    }

    const [updated] = await prisma.$transaction(ops);
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/contributors/:contributorId/donations/:donationId — delete donation
router.delete('/:contributorId/donations/:donationId', requirePermission('contributors:manage'), async (req, res, next) => {
  try {
    const donation = await prisma.donation.findUnique({ 
      where: { id: req.params.donationId }
    });
    if (!donation) throw new AppError('Doação não encontrada', 404);
    
    // Delete related ledger entry
    await prisma.ledgerEntry.deleteMany({
      where: { referenceId: donation.id, referenceType: 'DONATION' }
    });
    
    // Delete donation
    await prisma.donation.delete({ where: { id: req.params.donationId } });
    
    res.json({ message: 'Doação removida' });
  } catch (err) { next(err); }
});

module.exports = router;

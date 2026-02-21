// src/routes/finance.js
const router = require('express').Router();
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { requireAdmin } = require('../middleware/auth');
const { AppError } = require('../middleware/error');

async function getOrCreateWallet() {
  let wallet = await prisma.wallet.findFirst();
  if (!wallet) wallet = await prisma.wallet.create({ data: {} });
  return wallet;
}

async function calcBalance(walletId) {
  const cr = await prisma.ledgerEntry.aggregate({ where: { walletId, type: 'CREDIT' }, _sum: { amount: true } });
  const db = await prisma.ledgerEntry.aggregate({ where: { walletId, type: { in: ['DEBIT'] } }, _sum: { amount: true } });
  return parseFloat(cr._sum.amount || 0) - parseFloat(db._sum.amount || 0);
}

router.get('/wallet', requireAdmin, async (req, res, next) => {
  try {
    const wallet = await getOrCreateWallet();
    const balance = await calcBalance(wallet.id);
    res.json({ ...wallet, balance });
  } catch (err) { next(err); }
});

router.get('/ledger', requireAdmin, async (req, res, next) => {
  try {
    const wallet = await getOrCreateWallet();
    const { page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [entries, total] = await Promise.all([
      prisma.ledgerEntry.findMany({
        where: { walletId: wallet.id },
        include: { student: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit),
      }),
      prisma.ledgerEntry.count({ where: { walletId: wallet.id } }),
    ]);
    res.json({ entries, total });
  } catch (err) { next(err); }
});

router.post('/credit', requireAdmin, async (req, res, next) => {
  try {
    const data = z.object({
      amount: z.number().positive(),
      description: z.string().min(1),
      studentId: z.string().optional(),
      referenceType: z.string().optional(),
    }).parse(req.body);

    const wallet = await getOrCreateWallet();
    const entry = await prisma.ledgerEntry.create({
      data: { walletId: wallet.id, type: 'CREDIT', ...data },
    });
    res.status(201).json(entry);
  } catch (err) { next(err); }
});

router.post('/debit', requireAdmin, async (req, res, next) => {
  try {
    const data = z.object({
      amount: z.number().positive(),
      description: z.string().min(1),
    }).parse(req.body);

    const wallet = await getOrCreateWallet();
    const balance = await calcBalance(wallet.id);
    if (data.amount > balance) throw new AppError('Saldo insuficiente', 400);

    const entry = await prisma.ledgerEntry.create({
      data: { walletId: wallet.id, type: 'DEBIT', ...data },
    });
    res.status(201).json(entry);
  } catch (err) { next(err); }
});

router.post('/reverse/:id', requireAdmin, async (req, res, next) => {
  try {
    const original = await prisma.ledgerEntry.findUnique({ where: { id: req.params.id } });
    if (!original) throw new AppError('Entrada não encontrada', 404);

    const reversal = await prisma.ledgerEntry.create({
      data: {
        walletId: original.walletId,
        type: 'REVERSAL',
        amount: original.amount,
        description: `ESTORNO: ${original.description}`,
        referenceId: original.id,
        referenceType: 'REVERSAL',
      },
    });
    res.json(reversal);
  } catch (err) { next(err); }
});

router.get('/export/csv', requireAdmin, async (req, res, next) => {
  try {
    const wallet = await getOrCreateWallet();
    const entries = await prisma.ledgerEntry.findMany({
      where: { walletId: wallet.id },
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    });
    const csv = [
      'Data,Tipo,Valor,Descrição,Aluno',
      ...entries.map(e =>
        `${new Date(e.createdAt).toLocaleDateString('pt-BR')},${e.type},R$${parseFloat(e.amount).toFixed(2)},"${e.description}","${e.student?.name || ''}"`
      ),
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=financeiro.csv');
    res.send('\uFEFF' + csv);
  } catch (err) { next(err); }
});

module.exports = router;

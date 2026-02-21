// src/routes/dashboard.js
const router = require('express').Router();
const { requireAdmin } = require('../middleware/auth');
const { prisma } = require('../lib/prisma');

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const wallet = await prisma.wallet.findFirst();
    const [students, raffles, ledger] = await Promise.all([
      prisma.student.count({ where: { isActive: true } }),
      prisma.raffle.count({ where: { status: 'OPEN' } }),
      prisma.ledgerEntry.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { student: { select: { name: true } } } }),
    ]);

    const credits = await prisma.ledgerEntry.aggregate({ where: { type: 'CREDIT' }, _sum: { amount: true } });
    const debits  = await prisma.ledgerEntry.aggregate({ where: { type: 'DEBIT' }, _sum: { amount: true } });

    const topStudents = await prisma.student.findMany({
      where: { isActive: true },
      include: { donations: { select: { amount: true } } },
    });
    const ranked = topStudents
      .map(s => ({ id: s.id, name: s.name, photo: s.photo, total: s.donations.reduce((acc, d) => acc + parseFloat(d.amount), 0) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const monthly = await prisma.$queryRaw`
      SELECT TO_CHAR("createdAt", 'YYYY-MM') as month,
             SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END) as credits,
             SUM(CASE WHEN type = 'DEBIT'  THEN amount ELSE 0 END) as debits
      FROM "LedgerEntry"
      GROUP BY month ORDER BY month DESC LIMIT 12
    `;

    res.json({
      stats: {
        balance: parseFloat(credits._sum.amount || 0) - parseFloat(debits._sum.amount || 0),
        students,
        openRaffles: raffles,
        totalCredits: parseFloat(credits._sum.amount || 0),
        totalDebits: parseFloat(debits._sum.amount || 0),
      },
      topStudents: ranked,
      recentLedger: ledger,
      monthly: monthly.map(m => ({
        month: m.month,
        credits: parseFloat(m.credits || 0),
        debits: parseFloat(m.debits || 0),
      })).reverse(),
    });
  } catch (err) { next(err); }
});

module.exports = router;

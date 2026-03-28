// src/routes/dashboard.js
const router = require('express').Router();
const { requireAdmin } = require('../middleware/auth');
const { prisma } = require('../lib/prisma');

router.get('/stats', requireAdmin, async (req, res, next) => {
  try {
    const [activeStudents, activeRaffles, totalContributors, credits, debits] = await Promise.all([
      prisma.student.count({ where: { isActive: true } }),
      prisma.raffle.count({ where: { status: 'OPEN' } }),
      prisma.contributor.count(),
      prisma.ledgerEntry.aggregate({ where: { type: 'CREDIT' }, _sum: { amount: true } }),
      prisma.ledgerEntry.aggregate({ where: { type: { in: ['DEBIT', 'REVERSAL'] } }, _sum: { amount: true } })
    ]);

    const totalRaised = parseFloat(credits._sum.amount || 0);
    const totalSpent = parseFloat(debits._sum.amount || 0);

    const studentsWithDonations = await prisma.student.findMany({
      where: { isActive: true },
      include: { donations: { select: { amount: true } } }
    });
    const engagedStudents = studentsWithDonations.filter(s => s.donations.length > 0).length;

    const ticketsSold = await prisma.raffleParticipant.count();

    const topContributors = await prisma.contributor.findMany({
      include: { donations: { select: { amount: true } } }
    });
    const topTierContributors = topContributors.filter(c => {
      const total = c.donations.reduce((s, d) => s + parseFloat(d.amount), 0);
      return total >= 500;
    }).length;

    const recentActivity = await prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });

    res.json({
      totalRaised,
      activeStudents,
      engagedStudents,
      activeRaffles,
      totalTicketsSold: ticketsSold,
      totalContributors,
      topTierContributors,
      raisedTrend: 12.5,
      recentActivity: recentActivity.map(a => ({
        description: `${a.user?.name || 'Sistema'} - ${a.action} em ${a.module}`,
        timestamp: a.createdAt
      }))
    });
  } catch (err) { next(err); }
});

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

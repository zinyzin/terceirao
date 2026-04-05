// src/routes/public.js — No authentication required

const router = require('express').Router();

const { prisma } = require('../lib/prisma');



function isMissingTableError(err) {

  const msg = String(err?.message || '');

  return msg.includes('does not exist in the current database') || msg.includes('The table `public.');

}



function getLevel(total) {

  if (total >= 500) return 'OURO';

  if (total >= 200) return 'PRATA';

  if (total >= 50) return 'BRONZE';

  return 'APOIO';

}



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

      goalAmount: parseFloat(settingsMap.goalAmount || 0),

      siteName: settingsMap.siteName || 'Turma Pantera',

      siteDescription: settingsMap.siteDescription || 'Sistema de gestão do 3º Ano',

      year: settingsMap.year || new Date().getFullYear().toString(),

    });

  } catch (err) {

    if (isMissingTableError(err)) {

      res.json({

        studentCount: 0,

        totalRaised: 0,

        siteName: 'Turma Pantera',

        siteDescription: 'Sistema de gestão do 3º Ano',

        year: new Date().getFullYear().toString(),

      });

      return;

    }

    next(err);

  }

});



// GET /api/public/finance — thermometer data (no ledger)

router.get('/finance', async (req, res, next) => {

  try {

    const [totalRaised, settings] = await Promise.all([

      prisma.ledgerEntry.aggregate({ where: { type: 'CREDIT' }, _sum: { amount: true } }),

      prisma.siteSettings.findMany({ where: { key: { in: ['goalAmount'] } } }),

    ]);



    const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

    const goalAmount = Number(settingsMap.goalAmount || 0);

    const raised = parseFloat(totalRaised._sum.amount || 0);



    res.json({

      goalAmount,

      raised,

      progress: goalAmount > 0 ? Math.max(0, Math.min(1, raised / goalAmount)) : null,

    });

  } catch (err) {

    if (isMissingTableError(err)) {

      res.json({ goalAmount: 0, raised: 0, progress: null });

      return;

    }

    next(err);

  }

});

// GET /api/public/ledger — public ledger view (read-only)
router.get('/ledger', async (req, res, next) => {
  try {
    const wallet = await prisma.wallet.findFirst();
    if (!wallet) {
      return res.json({ entries: [], total: 0, balance: 0 });
    }

    const { page = 1, limit = 30 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [entries, total, credits, debits] = await Promise.all([
      prisma.ledgerEntry.findMany({
        where: { walletId: wallet.id },
        include: { student: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit),
      }),
      prisma.ledgerEntry.count({ where: { walletId: wallet.id } }),
      prisma.ledgerEntry.aggregate({ where: { walletId: wallet.id, type: 'CREDIT' }, _sum: { amount: true } }),
      prisma.ledgerEntry.aggregate({ where: { walletId: wallet.id, type: { in: ['DEBIT', 'REVERSAL'] } }, _sum: { amount: true } }),
    ]);

    const balance = parseFloat(credits._sum.amount || 0) - parseFloat(debits._sum.amount || 0);

    res.json({ entries, total, balance });
  } catch (err) {
    if (isMissingTableError(err)) {
      res.json({ entries: [], total: 0, balance: 0 });
      return;
    }
    next(err);
  }
});



// GET /api/public/teachers — public teacher listing
router.get('/teachers', async (req, res, next) => {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { isActive: true },
      select: {
        id: true, name: true, subject: true, photo: true,
        shortDescription: true, longDescription: true, catchphrase: true,
        isCounselor: true, counselorColor: true,
      },
      orderBy: [{ isCounselor: 'desc' }, { name: 'asc' }],
    });
    res.json(teachers);
  } catch (err) {
    if (isMissingTableError(err)) { res.json([]); return; }
    next(err);
  }
});

// GET /api/public/gallery — public gallery
router.get('/gallery', async (req, res, next) => {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, imageUrl: true, createdAt: true },
    });
    res.json(items);
  } catch (err) {
    if (isMissingTableError(err)) { res.json([]); return; }
    next(err);
  }
});

// GET /api/public/students — public student listing (no financial data)

router.get('/students', async (req, res, next) => {

  try {

    const students = await prisma.student.findMany({

      where: { isActive: true },

      select: { id: true, name: true, photo: true, shortDescription: true, longDescription: true, description: true },

      orderBy: { name: 'asc' },

    });

    res.json(students);

  } catch (err) {

    if (isMissingTableError(err)) {

      res.json([]);

      return;

    }

    next(err);

  }

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

  } catch (err) {

    if (isMissingTableError(err)) {

      res.json([]);

      return;

    }

    next(err);

  }

});



// GET /api/public/contributors — gamified ranking by level (no exact totals)

router.get('/contributors', async (req, res, next) => {

  try {

    const list = await prisma.contributor.findMany({

      include: { donations: { select: { amount: true } } },

      orderBy: { name: 'asc' },

    });



    const computed = list.map(c => {

      const total = c.donations.reduce((s, d) => s + parseFloat(d.amount), 0);

      const name = c.name?.trim() || 'Contribuinte';

      const isAnonymous = /an[oô]nimo/i.test(name);

      return {

        id: c.id,

        name: isAnonymous ? 'Contribuinte Anônimo' : name,

        level: getLevel(total),

        _total: total,

      };

    });



    const order = { OURO: 4, PRATA: 3, BRONZE: 2, APOIO: 1 };

    computed.sort((a, b) => (order[b.level] - order[a.level]) || (b._total - a._total) || a.name.localeCompare(b.name));



    res.json(computed.map(({ _total, ...rest }, idx) => ({ ...rest, rank: idx + 1 })));

  } catch (err) {

    if (isMissingTableError(err)) {

      res.json([]);

      return;

    }

    next(err);

  }

});



module.exports = router;


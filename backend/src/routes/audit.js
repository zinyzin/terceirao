// src/routes/audit.js
const router = require('express').Router();
const { prisma } = require('../lib/prisma');
const { requireSuperadmin } = require('../middleware/auth');

router.get('/', requireSuperadmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: { user: { select: { name: true, username: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit),
      }),
      prisma.auditLog.count(),
    ]);
    res.json({ logs, total });
  } catch (err) { next(err); }
});

module.exports = router;

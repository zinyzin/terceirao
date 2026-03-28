// src/routes/audit.js
const router = require('express').Router();
const { prisma } = require('../lib/prisma');
const { requireSuperadmin } = require('../middleware/auth');

router.get('/', requireSuperadmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 50, userId, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.createdAt.lt = end;
      }
    }
    
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { name: true, username: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take: parseInt(limit),
      }),
      prisma.auditLog.count({ where }),
    ]);
    res.json({ logs, total });
  } catch (err) { next(err); }
});

module.exports = router;

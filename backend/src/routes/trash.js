// src/routes/trash.js
const router = require('express').Router();
const { prisma } = require('../lib/prisma');
const { requireSuperadmin } = require('../middleware/auth');

// GET /api/trash — list all soft-deleted items
router.get('/', requireSuperadmin, async (req, res, next) => {
  try {
    const [students, teachers, products] = await Promise.all([
      prisma.student.findMany({
        where: { isActive: false },
        select: { id: true, name: true, photo: true, createdAt: true, updatedAt: true }
      }),
      prisma.teacher.findMany({
        where: { isActive: false },
        select: { id: true, name: true, subject: true, photo: true, createdAt: true, updatedAt: true }
      }),
      prisma.product.findMany({
        where: { isActive: false },
        select: { id: true, name: true, description: true, price: true, createdAt: true, updatedAt: true }
      }),
    ]);

    const items = [
      ...students.map(s => ({ ...s, type: 'STUDENT', title: s.name })),
      ...teachers.map(t => ({ ...t, type: 'TEACHER', title: t.name })),
      ...products.map(p => ({ ...p, type: 'PRODUCT', title: p.name })),
    ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    res.json({ items, total: items.length });
  } catch (err) { next(err); }
});

// POST /api/trash/:type/:id/restore — restore soft-deleted item
router.post('/:type/:id/restore', requireSuperadmin, async (req, res, next) => {
  try {
    const { type, id } = req.params;
    
    switch (type) {
      case 'STUDENT':
        await prisma.student.update({ where: { id }, data: { isActive: true } });
        break;
      case 'TEACHER':
        await prisma.teacher.update({ where: { id }, data: { isActive: true } });
        break;
      case 'PRODUCT':
        await prisma.product.update({ where: { id }, data: { isActive: true } });
        break;
      default:
        return res.status(400).json({ error: 'Tipo inválido' });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'RESTORE_FROM_TRASH',
        module: 'Trash',
        details: { itemId: id, itemType: type },
        ipAddress: req.ip,
        severity: 'WARNING'
      }
    });

    res.json({ message: 'Item restaurado com sucesso' });
  } catch (err) { next(err); }
});

// DELETE /api/trash/:type/:id — permanently delete item
router.delete('/:type/:id', requireSuperadmin, async (req, res, next) => {
  try {
    const { type, id } = req.params;
    
    switch (type) {
      case 'STUDENT':
        await prisma.student.delete({ where: { id } });
        break;
      case 'TEACHER':
        await prisma.teacher.delete({ where: { id } });
        break;
      case 'PRODUCT':
        await prisma.product.delete({ where: { id } });
        break;
      default:
        return res.status(400).json({ error: 'Tipo inválido' });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'PERMANENT_DELETE',
        module: 'Trash',
        details: { itemId: id, itemType: type },
        ipAddress: req.ip,
        severity: 'CRITICAL'
      }
    });

    res.json({ message: 'Item excluído permanentemente' });
  } catch (err) { next(err); }
});

module.exports = router;

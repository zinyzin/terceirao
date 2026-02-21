// src/routes/users.js  — Superadmin creates/manages admins with custom username+password
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { requireSuperadmin } = require('../middleware/auth');
const { AppError } = require('../middleware/error');

const createSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Apenas letras, números e _'),
  password: z.string().min(6, 'Senha mínima de 6 caracteres'),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'SUPERADMIN']).default('ADMIN'),
});

// GET /api/users — list all
router.get('/', requireSuperadmin, async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, name: true, role: true, isActive: true, createdAt: true, createdBy: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) { next(err); }
});

// POST /api/users — create admin
router.post('/', requireSuperadmin, async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);

    const exists = await prisma.user.findUnique({ where: { username: data.username } });
    if (exists) throw new AppError('Usuário já existe', 409);

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        username: data.username,
        passwordHash,
        name: data.name,
        role: data.role,
        createdBy: req.user.id,
      },
      select: { id: true, username: true, name: true, role: true, isActive: true, createdAt: true },
    });

    // Audit
    await prisma.auditLog.create({
      data: { userId: req.user.id, action: 'CREATE_USER', module: 'Users', details: { username: data.username, role: data.role }, ipAddress: req.ip },
    });

    res.status(201).json(user);
  } catch (err) { next(err); }
});

// PATCH /api/users/:id/password — superadmin resets password
router.patch('/:id/password', requireSuperadmin, async (req, res, next) => {
  try {
    const { password } = z.object({ password: z.string().min(6) }).parse(req.body);
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({ where: { id: req.params.id }, data: { passwordHash } });

    await prisma.auditLog.create({
      data: { userId: req.user.id, action: 'RESET_PASSWORD', module: 'Users', details: { targetId: req.params.id }, ipAddress: req.ip },
    });

    res.json({ message: 'Senha atualizada' });
  } catch (err) { next(err); }
});

// PATCH /api/users/:id/toggle — activate/deactivate
router.patch('/:id/toggle', requireSuperadmin, async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) throw new AppError('Não pode desativar a si mesmo', 400);

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new AppError('Usuário não encontrado', 404);

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true },
    });

    // Revoke sessions if deactivating
    if (!updated.isActive) {
      await prisma.session.updateMany({ where: { userId: req.params.id }, data: { isRevoked: true } });
    }

    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/users/:id
router.delete('/:id', requireSuperadmin, async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) throw new AppError('Não pode se deletar', 400);
    await prisma.session.deleteMany({ where: { userId: req.params.id } });
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'Usuário removido' });
  } catch (err) { next(err); }
});

module.exports = router;

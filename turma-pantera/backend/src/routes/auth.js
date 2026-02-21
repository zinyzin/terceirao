// src/routes/auth.js
const router = require('express').Router();
const bcrypt = require('bcrypt');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { generateAccessToken, generateRefreshToken } = require('../lib/jwt');
const { authenticate } = require('../middleware/auth');
const { AppError } = require('../middleware/error');

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.isActive) throw new AppError('Credenciais inválidas', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Credenciais inválidas', 401);

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken();

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
    });
  } catch (err) { next(err); }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) throw new AppError('Sem refresh token', 401);

    const session = await prisma.session.findUnique({
      where: { refreshToken: token },
      include: { user: true },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new AppError('Sessão inválida ou expirada', 401);
    }
    if (!session.user.isActive) throw new AppError('Usuário inativo', 401);

    // Rotate refresh token
    const newRefresh = generateRefreshToken();
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newRefresh, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const accessToken = generateAccessToken({ userId: session.user.id, role: session.user.role });
    res.json({ accessToken });
  } catch (err) { next(err); }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) await prisma.session.updateMany({ where: { refreshToken: token }, data: { isRevoked: true } });
    res.clearCookie('refreshToken');
    res.json({ message: 'Logout realizado' });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  const { passwordHash, ...user } = req.user;
  res.json(user);
});

module.exports = router;

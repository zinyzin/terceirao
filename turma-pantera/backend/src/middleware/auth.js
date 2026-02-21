// src/middleware/auth.js
const { verifyAccessToken } = require('../lib/jwt');
const { prisma } = require('../lib/prisma');
const { AppError } = require('./error');

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new AppError('Token não fornecido', 401);

    const token = header.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) throw new AppError('Usuário não encontrado ou inativo', 401);

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    next(err);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
}

const requireAdmin = [authenticate, requireRole('SUPERADMIN', 'ADMIN')];
const requireSuperadmin = [authenticate, requireRole('SUPERADMIN')];

module.exports = { authenticate, requireRole, requireAdmin, requireSuperadmin };

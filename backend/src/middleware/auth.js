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

    // Merge permissions from token (which has the latest permissions at login time)
    // with the user object. Token permissions take precedence for performance.
    req.user = {
      ...user,
      permissions: payload.permissions || user.permissions || [],
    };
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

function hasPermission(user, permission) {
  if (!user) return false;
  if (user.role === 'SUPERADMIN') return true;
  return Array.isArray(user.permissions) && user.permissions.includes(permission);
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    next();
  };
}

function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    if (req.user.role === 'SUPERADMIN') return next();
    if (permissions.some(permission => hasPermission(req.user, permission))) return next();
    return res.status(403).json({ error: 'Sem permissão para acessar este recurso' });
  };
}

const requireAdmin = [authenticate, requireRole('SUPERADMIN', 'ADMIN')];
const requireSuperadmin = [authenticate, requireRole('SUPERADMIN')];

module.exports = { authenticate, hasPermission, requireRole, requirePermission, requireAdmin, requireSuperadmin };

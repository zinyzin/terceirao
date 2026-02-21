// src/middleware/error.js
const { logger } = require('../lib/logger');

class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function errorHandler(err, req, res, next) {
  logger.error({ message: err.message, stack: err.stack, url: req.url });

  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Dados inválidos', details: err.errors });
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Registro já existe' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Não encontrado' });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Erro interno do servidor' : err.message,
  });
}

module.exports = { AppError, errorHandler };

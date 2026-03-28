// src/routes/events.js
const router = require('express').Router();
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { requireAdmin } = require('../middleware/auth');
const { AppError } = require('../middleware/error');

// GET /api/events - list all events
router.get('/', async (req, res, next) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    const where = { isActive: true };
    
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.startDate.lt = end;
      }
    }
    
    if (type) where.type = type;
    
    const events = await prisma.event.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { startDate: 'asc' }
    });
    
    res.json(events);
  } catch (err) { next(err); }
});

// GET /api/events/:id - get single event
router.get('/:id', async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { name: true } } }
    });
    if (!event) throw new AppError('Evento não encontrado', 404);
    res.json(event);
  } catch (err) { next(err); }
});

// POST /api/events - create event
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      startDate: z.string().datetime(),
      endDate: z.string().datetime().optional(),
      location: z.string().optional(),
      type: z.enum(['GENERAL', 'MEETING', 'DEADLINE', 'PAYMENT', 'RAFFLE', 'CELEBRATION']).default('GENERAL')
    });
    
    const data = schema.parse(req.body);
    
    const event = await prisma.event.create({
      data: {
        ...data,
        createdBy: req.user.id
      },
      include: { user: { select: { name: true } } }
    });
    
    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CREATE_EVENT',
        module: 'Events',
        details: { eventId: event.id, title: event.title },
        ipAddress: req.ip,
        severity: 'INFO'
      }
    });
    
    res.status(201).json(event);
  } catch (err) { next(err); }
});

// PUT /api/events/:id - update event
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      location: z.string().optional(),
      type: z.enum(['GENERAL', 'MEETING', 'DEADLINE', 'PAYMENT', 'RAFFLE', 'CELEBRATION']).optional()
    });
    
    const data = schema.parse(req.body);
    
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data,
      include: { user: { select: { name: true } } }
    });
    
    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_EVENT',
        module: 'Events',
        details: { eventId: event.id, title: event.title },
        ipAddress: req.ip,
        severity: 'INFO'
      }
    });
    
    res.json(event);
  } catch (err) { next(err); }
});

// DELETE /api/events/:id - soft delete event
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.event.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    
    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DELETE_EVENT',
        module: 'Events',
        details: { eventId: req.params.id },
        ipAddress: req.ip,
        severity: 'WARNING'
      }
    });
    
    res.json({ message: 'Evento removido' });
  } catch (err) { next(err); }
});

module.exports = router;

// src/routes/settings.js
const router = require('express').Router();
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { requireSuperadmin } = require('../middleware/auth');
const { AppError } = require('../middleware/error');

// Default settings
const DEFAULT_SETTINGS = {
  siteName: 'Turma Pantera',
  siteDescription: 'Formatura 2026',
  graduationYear: '2026',
  goalAmount: '50000',
  currency: 'BRL',
  contactEmail: '',
  enablePublicGallery: 'true',
  enablePublicContributors: 'true',
  themePrimary: '#60a5fa',
  themeSecondary: '#38bdf8',
};

// GET /api/settings — get all settings (public)
router.get('/', async (req, res, next) => {
  try {
    const settings = await prisma.siteSettings.findMany();
    const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));
    
    // Merge with defaults
    const result = { ...DEFAULT_SETTINGS, ...settingsMap };
    
    res.json(result);
  } catch (err) { next(err); }
});

// GET /api/settings/:key — get single setting (public)
router.get('/:key', async (req, res, next) => {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: req.params.key }
    });
    
    res.json({ 
      key: req.params.key, 
      value: setting?.value || DEFAULT_SETTINGS[req.params.key] || null 
    });
  } catch (err) { next(err); }
});

// PUT /api/settings — update settings (superadmin only)
router.put('/', requireSuperadmin, async (req, res, next) => {
  try {
    const schema = z.record(z.string());
    const updates = schema.parse(req.body);
    
    // Update or create each setting
    const results = await Promise.all(
      Object.entries(updates).map(async ([key, value]) => {
        return prisma.siteSettings.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        });
      })
    );
    
    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'UPDATE_SETTINGS',
        module: 'Settings',
        details: { updatedKeys: Object.keys(updates) },
        ipAddress: req.ip,
        severity: 'INFO'
      }
    });
    
    res.json({ message: 'Configurações atualizadas', settings: results });
  } catch (err) { next(err); }
});

// DELETE /api/settings/:key — reset setting to default (superadmin only)
router.delete('/:key', requireSuperadmin, async (req, res, next) => {
  try {
    await prisma.siteSettings.delete({ where: { key: req.params.key } });
    res.json({ message: 'Configuração resetada' });
  } catch (err) { 
    if (err.code === 'P2025') {
      return res.json({ message: 'Configuração já está no padrão' });
    }
    next(err); 
  }
});

module.exports = router;

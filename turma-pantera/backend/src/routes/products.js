// src/routes/products.js
const router = require('express').Router();
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { requireAdmin } = require('../middleware/auth');
const { AppError } = require('../middleware/error');

router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { sales: { select: { quantity: true, total: true } } },
    });
    res.json(products.map(p => ({
      ...p,
      totalSold: p.sales.reduce((s, sale) => s + sale.quantity, 0),
      totalRevenue: p.sales.reduce((s, sale) => s + parseFloat(sale.total), 0),
    })));
  } catch (err) { next(err); }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const data = z.object({ name: z.string().min(1), description: z.string().optional(), price: z.number().positive() }).parse(req.body);
    const p = await prisma.product.create({ data });
    res.status(201).json(p);
  } catch (err) { next(err); }
});

router.post('/:id/sell', requireAdmin, async (req, res, next) => {
  try {
    const { quantity, studentId } = z.object({ quantity: z.number().int().positive(), studentId: z.string().optional() }).parse(req.body);
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) throw new AppError('Produto não encontrado', 404);

    const total = parseFloat(product.price) * quantity;
    await prisma.sale.create({ data: { productId: product.id, quantity, total, studentId: studentId || null } });

    let wallet = await prisma.wallet.findFirst();
    if (!wallet) wallet = await prisma.wallet.create({ data: {} });
    await prisma.ledgerEntry.create({
      data: { walletId: wallet.id, type: 'CREDIT', amount: total, description: `Venda: ${product.name} x${quantity}`, studentId: studentId || null, referenceType: 'PRODUCT' },
    });
    res.status(201).json({ message: 'Venda registrada', total });
  } catch (err) { next(err); }
});

module.exports = router;

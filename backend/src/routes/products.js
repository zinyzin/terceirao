// src/routes/products.js
const router = require('express').Router();
const { z } = require('zod');
const { prisma } = require('../lib/prisma');
const { requireAdmin, requirePermission } = require('../middleware/auth');
const { AppError } = require('../middleware/error');

router.get('/', requirePermission('finance:detail'), async (req, res, next) => {
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

router.post('/', requirePermission('finance:detail'), async (req, res, next) => {
  try {
    const data = z.object({ name: z.string().min(1), description: z.string().optional(), price: z.number().positive() }).parse(req.body);
    const p = await prisma.product.create({ data });
    res.status(201).json(p);
  } catch (err) { next(err); }
});

router.post('/:id/sell', requirePermission('finance:detail'), async (req, res, next) => {
  try {
    const { quantity, studentId } = z.object({ quantity: z.number().int().positive(), studentId: z.string().optional() }).parse(req.body);
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) throw new AppError('Produto não encontrado', 404);

    const total = parseFloat(product.price) * quantity;

    let wallet = await prisma.wallet.findFirst();
    if (!wallet) wallet = await prisma.wallet.create({ data: {} });

    await prisma.$transaction([
      prisma.sale.create({ data: { productId: product.id, quantity, total, studentId: studentId || null } }),
      prisma.ledgerEntry.create({
        data: { walletId: wallet.id, type: 'CREDIT', amount: total, description: `Venda: ${product.name} x${quantity}`, studentId: studentId || null, referenceType: 'PRODUCT' },
      }),
    ]);
    res.status(201).json({ message: 'Venda registrada', total });
  } catch (err) { next(err); }
});

router.delete('/:id', requirePermission('finance:detail'), async (req, res, next) => {
  try {
    await prisma.sale.deleteMany({ where: { productId: req.params.id } });
    await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ message: 'Produto excluído' });
  } catch (err) { next(err); }
});

// GET /api/products/:id/sales — get sales history for a product
router.get('/:id/sales', requirePermission('finance:detail'), async (req, res, next) => {
  try {
    const sales = await prisma.sale.findMany({
      where: { productId: req.params.id },
      include: { student: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sales);
  } catch (err) { next(err); }
});

// PUT /api/products/:productId/sales/:saleId — edit a sale
router.put('/:productId/sales/:saleId', requirePermission('finance:detail'), async (req, res, next) => {
  try {
    const { quantity, studentId } = z.object({
      quantity: z.number().int().positive(),
      studentId: z.string().optional()
    }).parse(req.body);

    const sale = await prisma.sale.findUnique({
      where: { id: req.params.saleId },
      include: { product: true }
    });
    if (!sale) throw new AppError('Venda não encontrada', 404);

    const newTotal = parseFloat(sale.product.price) * quantity;

    const ledgerEntry = await prisma.ledgerEntry.findFirst({
      where: { referenceId: sale.id, referenceType: 'PRODUCT' }
    });

    const ops = [
      prisma.sale.update({
        where: { id: req.params.saleId },
        data: { quantity, total: newTotal, studentId: studentId || null }
      }),
    ];
    if (ledgerEntry) {
      ops.push(prisma.ledgerEntry.update({
        where: { id: ledgerEntry.id },
        data: { amount: newTotal, description: `Venda: ${sale.product.name} x${quantity}`, studentId: studentId || null },
      }));
    }

    const [updated] = await prisma.$transaction(ops);
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/products/:productId/sales/:saleId — delete a sale
router.delete('/:productId/sales/:saleId', requirePermission('finance:detail'), async (req, res, next) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.saleId }
    });
    if (!sale) throw new AppError('Venda não encontrada', 404);

    // Delete related ledger entry
    await prisma.ledgerEntry.deleteMany({
      where: { referenceId: sale.id, referenceType: 'PRODUCT' }
    });

    // Delete sale
    await prisma.sale.delete({ where: { id: req.params.saleId } });

    res.json({ message: 'Venda removida' });
  } catch (err) { next(err); }
});

module.exports = router;

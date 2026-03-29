// src/routes/reports.js
const router = require('express').Router();
const PDFDocument = require('pdfkit');
const { prisma } = require('../lib/prisma');
const { requireAdmin } = require('../middleware/auth');

// Helper to format currency
const fmt = n => `R$ ${Number(n||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;

// GET /api/reports/financial - Generate financial PDF report
router.get('/financial', requireAdmin, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        dateFilter.createdAt.lt = end;
      }
    }

    // Fetch data
    const [wallet, entries, students, contributors] = await Promise.all([
      prisma.wallet.findFirst(),
      prisma.ledgerEntry.findMany({
        where: dateFilter,
        include: { student: { select: { name: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.student.findMany({
        where: { isActive: true },
        select: { name: true, _count: { select: { donations: true } }, donations: { select: { amount: true } } },
      }),
      prisma.contributor.findMany({
        include: { donations: { select: { amount: true } } }
      })
    ]);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Turma Pantera - Relatório Financeiro', 50, 50);
    doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 50, 80);
    
    if (startDate || endDate) {
      doc.text(`Período: ${startDate ? new Date(startDate).toLocaleDateString('pt-BR') : 'Início'} até ${endDate ? new Date(endDate).toLocaleDateString('pt-BR') : 'Hoje'}`, 50, 95);
    }

    // Summary
    doc.moveDown(2);
    doc.fontSize(16).text('Resumo', 50, doc.y);
    doc.moveDown();
    
    const totalCredits = entries.filter(e => e.type === 'CREDIT').reduce((s, e) => s + parseFloat(e.amount), 0);
    const totalDebits = entries.filter(e => e.type === 'DEBIT').reduce((s, e) => s + parseFloat(e.amount), 0);
    const balance = totalCredits - totalDebits;

    doc.fontSize(12);
    doc.text(`Total de Entradas: ${fmt(totalCredits)}`, { align: 'left' });
    doc.text(`Total de Saídas: ${fmt(totalDebits)}`, { align: 'left' });
    doc.text(`Saldo: ${fmt(balance)}`, { align: 'left' });
    doc.text(`Total de Transações: ${entries.length}`, { align: 'left' });

    // Top Contributors
    doc.addPage();
    doc.fontSize(16).text('Maiores Contribuidores', 50, 50);
    doc.moveDown();
    
    const topContributors = contributors
      .map(c => ({ ...c, total: c.donations.reduce((s, d) => s + parseFloat(d.amount), 0) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    doc.fontSize(12);
    topContributors.forEach((c, i) => {
      doc.text(`${i + 1}. ${c.name}: ${fmt(c.total)}`, { align: 'left' });
    });

    // Top Students
    doc.addPage();
    doc.fontSize(16).text('Maiores Contribuidores (Alunos)', 50, 50);
    doc.moveDown();
    
    const topStudents = students
      .map(s => ({ ...s, totalDonated: s.donations.reduce((acc, d) => acc + parseFloat(d.amount), 0) }))
      .sort((a, b) => b.totalDonated - a.totalDonated)
      .slice(0, 10);

    topStudents.forEach((s, i) => {
      doc.text(`${i + 1}. ${s.name}: ${fmt(s.totalDonated)}`, { align: 'left' });
    });

    // Transaction Details
    if (entries.length > 0) {
      doc.addPage();
      doc.fontSize(16).text('Detalhes das Transações', 50, 50);
      doc.moveDown();
      
      doc.fontSize(10);
      entries.slice(0, 50).forEach(e => {
        const type = e.type === 'CREDIT' ? '↑' : e.type === 'DEBIT' ? '↓' : '↩';
        doc.text(`${type} ${new Date(e.createdAt).toLocaleDateString('pt-BR')} - ${e.description}: ${fmt(e.amount)}`, { align: 'left' });
      });
      
      if (entries.length > 50) {
        doc.moveDown();
        doc.text(`... e mais ${entries.length - 50} transações`, { align: 'center' });
      }
    }

    // Footer
    doc.fontSize(10).text('Turma Pantera - Sistema de Gestão de Formatura', 50, doc.page.height - 50, { align: 'center' });

    doc.end();
  } catch (err) { next(err); }
});

// GET /api/reports/students - Generate students PDF report
router.get('/students', requireAdmin, async (req, res, next) => {
  try {
    const studentsRaw = await prisma.student.findMany({
      where: { isActive: true },
      include: {
        donations: true,
        raffleParticipants: { include: { raffle: { select: { title: true } } } },
        raffleWins: { include: { raffle: { select: { title: true } } } },
      },
    });
    const students = studentsRaw
      .map(s => ({ ...s, totalDonated: s.donations.reduce((acc, d) => acc + parseFloat(d.amount), 0) }))
      .sort((a, b) => b.totalDonated - a.totalDonated);

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-alunos-${new Date().toISOString().split('T')[0]}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Turma Pantera - Relatório de Alunos', 50, 50);
    doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} - Total: ${students.length} alunos`, 50, 80);

    // Students list
    doc.moveDown(2);
    doc.fontSize(12);
    
    students.forEach((s, i) => {
      if (doc.y > 700) {
        doc.addPage();
      }
      
      doc.fontSize(14).text(`${i + 1}. ${s.name}`, 50, doc.y);
      doc.fontSize(10);
      doc.text(`   Contribuição: ${fmt(s.totalDonated)} | Doações: ${s.donations.length}`, { align: 'left' });
      doc.text(`   Tickets: ${s.raffleParticipants.reduce((acc, p) => acc + p.tickets, 0)} | Vitórias: ${s.raffleWins.length}`, { align: 'left' });
      
      if (s.raffleWins.length > 0) {
        doc.text(`   🏆 Ganhos: ${s.raffleWins.map(w => w.raffle.title).join(', ')}`, { align: 'left' });
      }
      
      doc.moveDown();
    });

    doc.fontSize(10).text('Turma Pantera - Sistema de Gestão de Formatura', 50, doc.page.height - 50, { align: 'center' });

    doc.end();
  } catch (err) { next(err); }
});

// GET /api/reports/products - Generate products sales PDF report
router.get('/products', requireAdmin, async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { sales: { include: { student: { select: { name: true } } } } }
    });

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-vendas-${new Date().toISOString().split('T')[0]}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Turma Pantera - Relatório de Vendas', 50, 50);
    doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 50, 80);

    // Summary
    doc.moveDown(2);
    doc.fontSize(16).text('Resumo de Vendas', 50, doc.y);
    doc.moveDown();
    
    const totalRevenue = products.reduce((sum, p) => sum + p.sales.reduce((s, sale) => s + parseFloat(sale.total), 0), 0);
    const totalSales = products.reduce((sum, p) => sum + p.sales.length, 0);

    doc.fontSize(12);
    doc.text(`Total de Vendas: ${totalSales}`, { align: 'left' });
    doc.text(`Receita Total: ${fmt(totalRevenue)}`, { align: 'left' });
    doc.text(`Produtos Ativos: ${products.length}`, { align: 'left' });

    // Products details
    doc.addPage();
    doc.fontSize(16).text('Detalhes por Produto', 50, 50);
    doc.moveDown();

    products.forEach((p, i) => {
      if (doc.y > 650) {
        doc.addPage();
        doc.fontSize(16).text('Detalhes por Produto (cont.)', 50, 50);
        doc.moveDown();
      }
      
      const productRevenue = p.sales.reduce((s, sale) => s + parseFloat(sale.total), 0);
      const totalSold = p.sales.reduce((s, sale) => s + sale.quantity, 0);
      
      doc.fontSize(14).text(`${i + 1}. ${p.name}`, 50, doc.y);
      doc.fontSize(10);
      doc.text(`   Preço: ${fmt(p.price)} | Vendidos: ${totalSold} | Receita: ${fmt(productRevenue)}`, { align: 'left' });
      
      if (p.sales.length > 0) {
        doc.text(`   Vendas:`, { align: 'left' });
        p.sales.slice(0, 5).forEach(s => {
          doc.text(`     - ${new Date(s.createdAt).toLocaleDateString('pt-BR')}: ${s.quantity}x ${fmt(s.total)}${s.student ? ` (${s.student.name})` : ''}`, { align: 'left' });
        });
        if (p.sales.length > 5) {
          doc.text(`     ... e mais ${p.sales.length - 5} vendas`, { align: 'left' });
        }
      }
      
      doc.moveDown();
    });

    doc.fontSize(10).text('Turma Pantera - Sistema de Gestão de Formatura', 50, doc.page.height - 50, { align: 'center' });

    doc.end();
  } catch (err) { next(err); }
});

module.exports = router;

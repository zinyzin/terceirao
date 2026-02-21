// src/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create wallet
  const wallet = await prisma.wallet.findFirst();
  if (!wallet) {
    await prisma.wallet.create({ data: {} });
    console.log('✅ Wallet created');
  }

  // Default site settings
  const settings = [
    { key: 'siteName', value: 'Turma Pantera' },
    { key: 'siteDescription', value: 'Sistema de gestão do 3º Ano — Turma Pantera' },
    { key: 'year', value: new Date().getFullYear().toString() },
  ];
  for (const s of settings) {
    await prisma.siteSettings.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log('✅ Site settings created');

  // Superadmin
  const superUsername = process.env.SUPERADMIN_USERNAME || 'superadmin';
  const superPassword = process.env.SUPERADMIN_PASSWORD || 'Pantera@2024!';

  const existing = await prisma.user.findUnique({ where: { username: superUsername } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(superPassword, 12);
    await prisma.user.create({
      data: { username: superUsername, passwordHash, name: 'Super Administrador', role: 'SUPERADMIN' },
    });
    console.log(`✅ Superadmin created`);
    console.log(`   Username: ${superUsername}`);
    console.log(`   Password: ${superPassword}`);
    console.log(`   ⚠️  Change this password immediately in production!`);
  } else {
    console.log('⚠️  Superadmin already exists, skipping');
  }

  console.log('🐾 Seed complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

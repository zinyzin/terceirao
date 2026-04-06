// src/start.js — Robust startup script for Railway
const { execSync } = require('child_process');

async function start() {
  // Step 1: Prisma db push (non-fatal — table might already exist)
  try {
    console.log('📦 Running prisma db push...');
    execSync('npx prisma db push --skip-generate', { stdio: 'inherit', timeout: 30000 });
    console.log('✅ Database synced');
  } catch (e) {
    console.warn('⚠️  prisma db push failed (may be already synced):', e.message);
  }

  // Step 2: Seed (non-fatal)
  try {
    console.log('🌱 Running seed...');
    const seed = require('./seed');
    await seed();
  } catch (e) {
    console.warn('⚠️  Seed warning:', e.message);
  }

  // Step 3: Start server (must succeed)
  console.log('🚀 Starting server...');
  require('./index');
}

start().catch(e => {
  console.error('❌ Fatal startup error:', e);
  process.exit(1);
});

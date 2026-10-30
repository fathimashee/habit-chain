const app = require('./app');
const { runMigrations } = require('../db/migrate');
const { seedDatabase } = require('../db/seeds/seed');
const { AdminModel } = require('./models/adminModel');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

async function init() {
  // 1. Run SQLite migrations (synchronous)
  try {
    runMigrations();
  } catch (e) {
    console.error('Migration notice:', e.message);
  }

  // 2. Connect to MongoDB Atlas
  try {
    const { connectMongo } = require('./models/mongo/connection');
    await connectMongo();
    console.log('✅ MongoDB Atlas connected');
  } catch (e) {
    console.warn('⚠️  MongoDB Atlas connection failed (continuing with SQLite only):', e.message);
  }

  // 3. Seed SQLite (synchronous)
  try {
    seedDatabase();
  } catch (e) {
    console.error('SQLite seed notice:', e.message);
  }

  // 4. Ensure default admin (now async — writes to both Atlas + SQLite)
  try {
    await AdminModel.ensureDefaultAdmin();
  } catch (e) {
    console.error('Admin init notice:', e.message);
  }

  // 5. Start HTTP server
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`Educational Resource Platform running!`);
    console.log(`Public Portal:  http://localhost:${PORT}`);
    console.log(`Admin Portal:   http://localhost:${PORT}/admin/login`);
    console.log(`Environment:    ${process.env.NODE_ENV || 'development'}`);
    console.log(`===============================================`);
  });
}

init().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});


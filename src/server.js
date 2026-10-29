const app = require('./app');
const { runMigrations } = require('../db/migrate');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Auto-run migrations on startup if necessary
try {
  runMigrations();
} catch (e) {
  console.error('Migration check notice:', e.message);
}

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`Educational Resource Platform running!`);
  console.log(`Public Portal:  http://localhost:${PORT}`);
  console.log(`Admin Portal:   http://localhost:${PORT}/admin/login`);
  console.log(`Environment:    ${process.env.NODE_ENV || 'development'}`);
  console.log(`===============================================`);
});


const fs = require('fs');
const path = require('path');
const { getDb } = require('./connection');

function runMigrations() {
  console.log('Running database migrations...');
  const db = getDb();
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    console.log(`Executing migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.exec(sql);
  }
  console.log('Migrations completed successfully.');
}

if (require.main === module) {
  try {
    runMigrations();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

module.exports = { runMigrations };


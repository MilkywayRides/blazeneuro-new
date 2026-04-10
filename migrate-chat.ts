import { db } from './src/lib/db';
import { sql } from 'drizzle-orm';
import * as fs from 'fs';

async function migrate() {
  try {
    console.log('Running chat tables migration...');
    
    const migrationSQL = fs.readFileSync('./drizzle/0011_add_chat_tables.sql', 'utf-8');
    
    await db.execute(sql.raw(migrationSQL));
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();

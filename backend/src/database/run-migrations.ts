import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  const ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'spadm',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: false,
  });

  await ds.initialize();
  await ds.runMigrations();
  console.log('Migrations run successfully');
  await ds.destroy();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

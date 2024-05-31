import dotenv from 'dotenv';
dotenv.config({
  path: '.env.migrations',
});
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT!, 10),
  logging: true,
  synchronize: false,
  entities: ['**/*.entity.ts'],
  migrations: ['./migrations/*.ts'],
});

import dotenv from 'dotenv';
dotenv.config({
  path: '.env.migrations',
});
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT!, 10),
  logging: true,
  synchronize: false,
  entities: ['**/*.entity.ts'],
  seeds: ['./seeds/*.seed.ts'],
  migrations: ['./migrations/*.ts'],
};

export default new DataSource(options);

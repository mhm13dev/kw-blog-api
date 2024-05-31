import 'reflect-metadata';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({
  path: path.resolve(__dirname, '../../.env.migrations'),
});
import { DataSource } from 'typeorm';
import { User } from 'src/user/entities';

export const AppDataSource = new DataSource({
  type: 'mongodb',
  host: process.env.MONGO_HOST,
  port: parseInt(process.env.MONGO_PORT!, 10),
  username: process.env.MONGO_INITDB_ROOT_USERNAME,
  password: process.env.MONGO_INITDB_ROOT_PASSWORD,
  database: process.env.MONGO_DATABASE,
  authSource: 'admin',
  synchronize: process.env.NODE_ENV !== 'production',
  entities: [User],
});

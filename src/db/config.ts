import dotenv from 'dotenv';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Client } from '../models/Client';
import { Message } from '../models/Message';
import { Debt } from '../models/Debt';

dotenv.config();

// dev config
// uncomment this section to use the local database
// export const AppDataSource = new DataSource({
//   type: process.env.DB_TYPE as 'postgres',
//   host: process.env.DB_HOST || 'localhost',
//   port: Number(process.env.DB_PORT) || 5432,
//   username: process.env.DB_USER || 'postgres',
//   password: process.env.DB_PASS || 'postgres',
//   database: process.env.DB_NAME || 'postgres',
//   synchronize: true,
//   logging: false,
//   entities: [Client, Message, Debt],
// });

// prod config
// uncomment this section to use the production database
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: false,
  entities: [Client, Message, Debt],
});
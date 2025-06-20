import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Client } from '../models/Client';
import { Message } from '../models/Message';
import { Debt } from '../models/Debt';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'tu_contraseña',
  database: 'automotora',
  synchronize: true,
  logging: false,
  entities: [Client, Message, Debt],
});

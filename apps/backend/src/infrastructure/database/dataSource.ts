import { DataSource } from 'typeorm';
import { env } from '../config/env';
import { Task } from '../../domain/entities/Task';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  entities: [Task],
  synchronize: !env.NODE_ENV.startsWith('prod'),
  logging: false,
});

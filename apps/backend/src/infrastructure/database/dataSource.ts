import { DataSource } from 'typeorm';
import { join } from 'path';
import { env } from '../config/env';

const isProduction = env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  entities: [
    isProduction
      ? join(__dirname, '../../domain/entities/**/*.js')
      : join(__dirname, '../../domain/entities/**/*.ts'),
  ],
  synchronize: !isProduction,
  logging: false,
});

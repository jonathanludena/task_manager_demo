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
  // Dev (tsx): busca .ts en src/. Prod (compilado): busca .js en dist/.
  migrations: env.NODE_ENV.startsWith('prod')
    ? ['dist/infrastructure/database/migrations/*.js']
    : ['src/infrastructure/database/migrations/*.ts'],
  migrationsRun: env.NODE_ENV.startsWith('prod'),
  synchronize: !env.NODE_ENV.startsWith('prod'),
  logging: false,
});

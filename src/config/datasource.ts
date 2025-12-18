import { DataSource, DataSourceOptions } from 'typeorm';
import { envs } from './envs';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mariadb',
  host: envs.dbHost,
  port: envs.dbPort,
  username: envs.dbUsername,
  password: envs.dbPassword || '',
  database: envs.dbName,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/migrations/*.js'],
  migrationsTableName: 'migrations',
  logging: envs.nodeEnv !== 'production',
  migrationsRun: false,
  extra: {
    connectionLimit: 10, // Adjust based on your database connection pool requirements
  },
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;

import { winstonLogger } from '@greatdaveo/jobint-shared';
import { config } from '@auth/config';
import { Logger } from 'winston';
import { Sequelize } from 'sequelize';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authDatabaseServer', 'debug');

export const authSequelize: Sequelize = new Sequelize(process.env.MYSQL_DB!, {
  dialect: 'mssql',
  logging: false,
  dialectOptions: {
    multipleStatements: true // To run multiple queries
  }
});

// For Database connection
export async function databaseConnection(): Promise<void> {
  try {
    await authSequelize.authenticate();
    log.info('AuthService Mysql database connection has been established successfully.');
  } catch (error) {
    log.error('Auth Service - Unable to connect to database');
    log.log('error', 'AuthService databaseConnection() method error', error);
  }
}

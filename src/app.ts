import express, { Express } from 'express';
import { startAuthServer } from '@auth/server';
import { databaseConnection } from '@auth/database';

const initialize = (): void => {
  const app: Express = express();
  databaseConnection();
  startAuthServer(app);
};

initialize();

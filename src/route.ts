import { Application } from 'express';
import { authRoutes } from '@auth/routes/authRoutes';
import { verifyGatewayRequest } from '@greatdaveo/jobint-shared';

const BASE_PATH = '/api/v1//auth';

export function appRoute(app: Application): void {
  app.use(BASE_PATH, verifyGatewayRequest, authRoutes());
};



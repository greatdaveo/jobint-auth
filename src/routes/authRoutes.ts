import { signupUser } from '@auth/controllers/signupController';
import express, { Application, Router } from 'express';

const router: Router = express.Router();

export function authRoutes(): Router {
  router.post('/signup', signupUser);

  return router;
}

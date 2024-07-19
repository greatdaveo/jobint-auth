import { Application } from 'express';

export function appRoute(app: Application): void {
  app.use('', () => console.log('appRoute'));
}

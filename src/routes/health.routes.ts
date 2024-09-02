import { healthCheck } from '../controllers/health.controller';
import { CommonRoutesConfig } from './common.routes.config';
import express from 'express';

export class HealthRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'HealthRoutes');
  }

  configureRoutes() {
    this.app.route(`/health`).get(healthCheck);
    return this.app;
  }
}

import { LockersController } from '../controllers/lockers.controller';
import { CommonRoutesConfig } from './common.routes.config';
import express from 'express';

export class LockersRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'LockersRoutes');
  }

  configureRoutes() {

    const lockersController = new LockersController();

    this.app.route(`/lockers`)
      .get(lockersController.list)

    this.app.route(`/lockers/new`)
      .put(lockersController.save);

    this.app.route(`/lockers/:id`)
      .all((_req: express.Request, _res: express.Response, next: express.NextFunction) => {
        // this middleware function runs before any request to /path/:pathId
        // but it doesn't accomplish anything just yet---
        // it simply passes control to the next applicable function below using next()
        next();
      })
      .get(lockersController.getById)
      .patch(lockersController.update)
      .delete(lockersController.delete);

    return this.app;
  }
}

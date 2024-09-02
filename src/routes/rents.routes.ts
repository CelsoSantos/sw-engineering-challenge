import { RentsController } from '../controllers/rents.controller';
import { CommonRoutesConfig } from './common.routes.config';
import express from 'express';

export class RentsRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'RentsRoutes');
  }

  configureRoutes() {
    const rentsController = new RentsController();

    this.app.route(`/rents`).get(rentsController.list);

    this.app.route(`/rents/new`).put(rentsController.save);

    this.app
      .route(`/rents/:id`)
      .all(
        (
          _req: express.Request,
          _res: express.Response,
          next: express.NextFunction,
        ) => {
          // this middleware function runs before any request to /path/:pathId
          // but it doesn't accomplish anything just yet---
          // it simply passes control to the next applicable function below using next()
          next();
        },
      )
      .get(rentsController.getById)
      .patch(rentsController.update)
      .delete(rentsController.delete);

    return this.app;
  }
}

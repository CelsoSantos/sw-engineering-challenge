import { BloqsController } from '../controllers/bloqs.controller';
import { CommonRoutesConfig } from './common.routes.config';
import express from 'express';

export class BloqsRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(app, 'BloqsRoutes');
  }

  configureRoutes() {
    const bloqsController = new BloqsController();

    this.app.route(`/bloqs`).get(bloqsController.list);

    this.app.route(`/bloqs/new`).put(bloqsController.save);

    this.app
      .route(`/bloqs/:id`)
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
      .get(bloqsController.getById)
      .patch(bloqsController.update)
      .delete(bloqsController.delete);

    return this.app;
  }
}

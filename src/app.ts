import * as dotenv from "dotenv";
dotenv.config();

import express, { Express, Request, Response } from "express";
import { CommonRoutesConfig, HealthRoutes, BloqsRoutes, LockersRoutes, RentsRoutes } from "./routes";

import { HttpStatusCode } from "./utils/HttpStatusCodes.enum";

class ExpressApp {

  public app: Express;
  private server: any;

  constructor() {
    this.app = express();
  }

  public startServer = (port: number): void => {
    this.server = this.app.listen(port, () => {
      console.log(`[Server]: Server is running at http://localhost:${port}`);
    });
  }

  public stopServer = (): void => {
    this.server.close(() => {
      //console.log('HTTP server closed');
    });
  }

  private initMiddleware = (): void => {
    this.app.use(express.json());
  }

  private setupRoutes = (): void => {
    this.app.get('/', async (req: Request, res: Response) => {
      res.status(HttpStatusCode.OK).send('Hello! My name is Celso Santos');
    });

    const routes: Array<CommonRoutesConfig> = [];
    routes.push(new HealthRoutes(this.app));
    routes.push(new BloqsRoutes(this.app));
    routes.push(new LockersRoutes(this.app));
    routes.push(new RentsRoutes(this.app));
  }

  public initApp = async (): Promise<void> => {
    this.initMiddleware();
    this.setupRoutes();
  }
}

export default ExpressApp;

import * as dotenv from "dotenv";
dotenv.config();

import express, { Express, Request, Response } from "express";
import { CommonRoutesConfig, HealthRoutes } from "./routes";

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
      res.status(200).send('Hello! My name is Celso Santos');
    });

    const routes: Array<CommonRoutesConfig> = [];
    routes.push(new HealthRoutes(this.app));
  }

  public initApp = async (): Promise<void> => {
    this.initMiddleware();
    this.setupRoutes();
  }
}

export default ExpressApp;

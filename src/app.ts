import * as dotenv from "dotenv";
dotenv.config();

import http, { Server } from "http";

import express, { Express, Request, Response } from "express";
import { startServer, shutdownServer } from "./server";

const app: Express = express();

const server: Server = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('Hello! My name is Celso Santos');
});

startServer();

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server')
  await shutdownServer();
})

export default app;

import * as dotenv from "dotenv";
dotenv.config();

import { createExpressAppInstance, getExpressAppInstance } from "./appInstance";
import { initDb } from "./db/dbManager";

// Read the port from environment variables or use a default port
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const initAppAndListen = async () => {
  let expressApp = getExpressAppInstance();

  if (!expressApp) {
    expressApp = createExpressAppInstance();
    await expressApp.initApp();
  }

  await expressApp.startServer(port);
};

// Initialize in-memory, file-based, "DB"
initDb();

// Initialize Server
initAppAndListen();

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server')
  let expressApp = getExpressAppInstance();
  await expressApp.stopServer();
})

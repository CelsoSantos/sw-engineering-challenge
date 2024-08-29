import http, { Server } from "http";
import app from "./app";

import * as dotenv from "dotenv";
dotenv.config();

const server: Server = http.createServer(app);
const port = process.env.PORT || 3000;

// server.listen(port, () => {
//   console.log(`[Server]: Server is running at http://localhost:${port}`);
// })

export const startServer = async () => {
  server.listen(port, () => {
    return console.log(`[Server]: Server is running at http://localhost:${port}`);
  })
}

export const shutdownServer = async () => {
  server.close(() => {
    return console.log('HTTP server closed');
  })
}

export default server;

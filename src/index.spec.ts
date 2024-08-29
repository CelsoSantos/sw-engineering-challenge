import ExpressApp from "./app";
import { createExpressAppInstance, getExpressAppInstance } from "./appInstance";
import { Express } from "express";
import request from "supertest";

let expressApp: ExpressApp;

beforeAll(async () => {
  expressApp = getExpressAppInstance();

  if (!expressApp) {
    expressApp = createExpressAppInstance();
    await expressApp.initApp();
  }

  // Generate a random port from 3000 - 8000
  const min = 3000;
  const max = 8000;

  const port = Math.floor(Math.random() * (max - min + 1)) + min;
  expressApp.startServer(port);
})

// beforeEach(async () => {
//   await startServer();
// })

// afterEach(async () => {
//   await shutdownServer();
// })

afterAll(async () => {
  await expressApp.stopServer();
})

export const getApp = (): Express => {
  return expressApp.app;
};

describe("GET /", () => {
  it('responds with "Hello! My name is Celso Santos"', async () => {
    const response = await request(getApp()).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      "Hello! My name is Celso Santos"
    );
  });
});

describe("GET /health", () => {
  it('responds with a 200 OK', async () => {
    const response = await request(getApp()).get("/health")
    expect(response.status).toBe(200);
    expect(response.text).toBe("OK");
  });
});

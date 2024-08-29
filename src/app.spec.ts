import app from "./app";
import request from "supertest";
import { shutdownServer, startServer } from "./server"

beforeAll(async () => {
  await shutdownServer();
})

beforeEach(async () => {
  await startServer();
})

afterEach(async () => {
  await shutdownServer();
})

describe("GET /", () => {
  it('responds with "Hello! My name is Celso Santos"', async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe(
      "Hello! My name is Celso Santos"
    );
  });
});

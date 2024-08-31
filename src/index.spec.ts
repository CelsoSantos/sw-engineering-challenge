import ExpressApp from "./app";
import { createExpressAppInstance, getExpressAppInstance } from "./appInstance";
import { Express } from "express";
import request from "supertest";
import { HttpStatusCode } from "./utils/HttpStatusCodes.enum";
import { initDb } from "./db/dbManager";
import { Bloq } from "./models";

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
  initDb();
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
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.text).toBe(
      "Hello! My name is Celso Santos"
    );
  });
});

describe("GET /health", () => {
  it('responds with a 200 OK', async () => {
    const response = await request(getApp()).get("/health")
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.text).toBe("OK");
  });
});

describe("GET /bloqs", () => {
  it('responds with the X number of Bloqs, where X is the page size', async () => {
    const response = await request(getApp()).get("/bloqs")
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.page).toBe(1);
    expect(response.body.per_page).toBe(10); // Default size: 10
    expect(response.body.total).toBe(3); // Init size: 3 elements
    expect(response.body.data.length).toBe(3); // Length should match total
    let bloq: Bloq = response.body.data[0];
    expect(bloq.id).toBe("c3ee858c-f3d8-45a3-803d-e080649bbb6f");
    // (...)
  });

  it('responds with the requested Bloq detailed information', async () => {
    const response = await request(getApp()).get("/bloqs/c3ee858c-f3d8-45a3-803d-e080649bbb6f")
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.id).toBe("c3ee858c-f3d8-45a3-803d-e080649bbb6f");
    expect(response.body.title).toBe("Luitton Vouis Champs Elysées");
    expect(response.body.address).toBe("101 Av. des Champs-Élysées, 75008 Paris, France");
  });
});

describe("PUT /bloqs/new", () => {
  let newBloq = {
    title: "Some new Bloq",
    address: "Some address"
  }
  it('adds a new Bloq and responds with the Bloq data', async () => {
    const response = await request(getApp()).put("/bloqs/new").send(newBloq);
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.title).toBe(newBloq.title);
    expect(response.body.address).toBe(newBloq.address);
  });

  it('responds with the X number of Bloqs, including the new Bloq', async () => {
    const response = await request(getApp()).get("/bloqs")
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.page).toBe(1);
    expect(response.body.per_page).toBe(10); // Default size: 10
    expect(response.body.total).toBe(4); // Should have 4 elements now
    expect(response.body.data.length).toBe(4); // Length should match total
    let bloq: Bloq = response.body.data[3];
    expect(bloq.title).toBe(newBloq.title);
    expect(bloq.address).toBe(newBloq.address);
    // (...)
  });
});

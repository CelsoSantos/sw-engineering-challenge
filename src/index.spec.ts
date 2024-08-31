import ExpressApp from "./app";
import { createExpressAppInstance, getExpressAppInstance } from "./appInstance";
import { Express } from "express";
import request from "supertest";
import { HttpStatusCode } from "./utils/HttpStatusCodes.enum";
import { initDb } from "./db/dbManager";
import { Bloq, Locker, LockerStatus } from "./models";

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
    expect(response.body.total).toBe(3); // Initial size: 3 elements
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

  it('responds with the requested Bloq detailed information, including Bloq Lockers', async () => {
    const response = await request(getApp()).get("/bloqs/c3ee858c-f3d8-45a3-803d-e080649bbb6f?lockers=true")
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.id).toBe("c3ee858c-f3d8-45a3-803d-e080649bbb6f");
    expect(response.body.title).toBe("Luitton Vouis Champs Elysées");
    expect(response.body.address).toBe("101 Av. des Champs-Élysées, 75008 Paris, France");
    expect(response.body.lockers.length).toBe(3) // Init data includes 3 lockers
    let locker: Locker = response.body.lockers[1];
    expect(locker.bloqId).toBe("c3ee858c-f3d8-45a3-803d-e080649bbb6f")
    expect(locker.status).toBe(LockerStatus.OPEN)
    expect(locker.isOccupied).toBeFalsy();
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
    expect(response.body.total).toBeGreaterThan(3); // Should have 4 elements now
    expect(response.body.total).toBe(4); // Let's check: 4 elements now
    expect(response.body.data.length).toBe(4); // Length should match total
    let bloq: Bloq = response.body.data[3];
    expect(bloq.title).toBe(newBloq.title);
    expect(bloq.address).toBe(newBloq.address);
    // (...)
  });
});

describe("GET /lockers", () => {
  it('responds with the X number of Lockers, where X is the page size', async () => {
    const response = await request(getApp()).get("/lockers")
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.page).toBe(1);
    expect(response.body.per_page).toBe(10); // Default size: 10
    expect(response.body.total).toBe(9); // Initial size: 9 elements
    expect(response.body.data.length).toBe(9); // Length should match total
    let locker: Locker = response.body.data[0];
    expect(locker.id).toBe("1b8d1e89-2514-4d91-b813-044bf0ce8d20");
    // (...)
  });

  it('responds with the requested Locker detailed information', async () => {
    const response = await request(getApp()).get("/lockers/1b8d1e89-2514-4d91-b813-044bf0ce8d20")
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.id).toBe("1b8d1e89-2514-4d91-b813-044bf0ce8d20");
    expect(response.body.bloqId).toBe("c3ee858c-f3d8-45a3-803d-e080649bbb6f");
    expect(response.body.status).toBe(LockerStatus.CLOSED);
    expect(response.body.isOccupied).toBeTruthy();
  });
});

describe("PUT /lockers/new", () => {
  let newLocker = {
    bloqId: "22ffa3c5-3a3d-4f71-81f1-cac18ffbc510",
    status: LockerStatus.OPEN,
    isOccupied: true
  }
  it('adds a new Locker and responds with the Locker data', async () => {
    const response = await request(getApp()).put("/lockers/new").send(newLocker);
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.bloqId).toBe(newLocker.bloqId);
    expect(response.body.status).toBe(newLocker.status);
    expect(response.body.isOccupied).toBeTruthy();
  });

  it('responds with the X number of Lockers, including the new Locker', async () => {
    const response = await request(getApp()).get("/lockers")
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.page).toBe(1);
    expect(response.body.per_page).toBe(10); // Default size: 10
    expect(response.body.total).toBeGreaterThan(9); // Should have 10 elements now
    expect(response.body.total).toBe(10); // Should have 10 elements now
    expect(response.body.data.length).toBe(10); // Length should match total
    let locker: Locker = response.body.data[9];
    expect(locker.bloqId).toBe(newLocker.bloqId);
    expect(locker.status).toBe(newLocker.status);
    expect(locker.isOccupied).toBe(newLocker.isOccupied);
    // (...)
  });
});

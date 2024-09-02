import ExpressApp from "../app";
import { createExpressAppInstance, getExpressAppInstance } from "../appInstance";
import { Express } from "express";
import request from "supertest";
import { HttpStatusCode } from "../utils/HttpStatusCodes.enum";
import { initDb } from "../db/dbManager";
import { Rent, RentStatus, RentSize, Locker, LockerStatus } from "../models";

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
  // initTestDb();
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


/**
 * Lockers Tests
 */

describe("GET /lockers", () => {
  it('responds with a list of X <= 10 Lockers, where 10 is the default page size, when per_page not given', async () => {
    const response = await request(getApp()).get("/lockers")
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.page).toBe(1);
    expect(response.body.per_page).toBe(10); // Default size: 10
    expect(response.body.total).toBe(9); // Initial size: 9 elements
    expect(response.body.data.length).toBe(9); // Length should match total
    let locker: Locker = response.body.data[0];
    expect(locker.id).toBe("1b8d1e89-2514-4d91-b813-044bf0ce8d20");
  });

  it('responds with a list of X <= N Lockers, where N is the given per_page size,', async () => {
    const response = await request(getApp()).get("/lockers?page=1&per_page=20");
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.page).toBe(1);
    expect(response.body.per_page).toBe(20); // Default size: 10
    expect(response.body.total).toBe(9); // Initial size: 9 elements
    expect(response.body.data.length).toBe(9); // Length should match total
    let locker: Locker = response.body.data[0];
    expect(locker.id).toBe("1b8d1e89-2514-4d91-b813-044bf0ce8d20");
  });

  it('responds with an emtpy list Lockers, when page greater than the existing number of Lockers,', async () => {
    const response = await request(getApp()).get("/lockers?page=5&per_page=20");
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.page).toBe(5);
    expect(response.body.per_page).toBe(20);
    expect(response.body.total).toBe(9); // Initial size: 9 elements
    expect(response.body.data.length).toBe(0); // Length should be 0 since we overshoot the number of items
  });

  it('responds with 400 Bad Request when page is not a number', async () => {
    const response = await request(getApp()).get("/lockers?page=x&per_page=10")
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  it('responds with 400 Bad Request when per_page is not a number', async () => {
    const response = await request(getApp()).get("/lockers?page=1&per_page=xx")
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  it('responds with 404 Not Found when Locker does not exist', async () => {
    const response = await request(getApp()).get("/locker/3c81a85b-d0ae-4294-8966-adf21922d5b7")
    expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
  });

  it('responds with the requested Locker detailed information', async () => {
    const response = await request(getApp()).get("/lockers/1b8d1e89-2514-4d91-b813-044bf0ce8d20")
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.id).toBe("1b8d1e89-2514-4d91-b813-044bf0ce8d20");
    expect(response.body.bloqId).toBe("c3ee858c-f3d8-45a3-803d-e080649bbb6f");
    expect(response.body.status).toBe(LockerStatus.CLOSED);
    expect(response.body.isOccupied).toBeTruthy();
  });

  it('responds with the requested Lockers detailed information, including Rents in Lockers', async () => {
    const response = await request(getApp()).get("/lockers/1b8d1e89-2514-4d91-b813-044bf0ce8d20?rents=true")
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.id).toBe("1b8d1e89-2514-4d91-b813-044bf0ce8d20");
    expect(response.body.bloqId).toBe("c3ee858c-f3d8-45a3-803d-e080649bbb6f");
    expect(response.body.status).toBe(LockerStatus.CLOSED);
    expect(response.body.isOccupied).toBeTruthy();
    expect(response.body.rents.length).toBe(1) // Init data includes 1 rent
    let rent: Rent = response.body.rents[0];
    expect(rent.id).toBe("40efc6fd-f10c-4561-88bf-be916613377c");
    expect(rent.lockerId).toBe("1b8d1e89-2514-4d91-b813-044bf0ce8d20");
    expect(rent.status).toBe(RentStatus.WAITING_PICKUP);
    expect(rent.size).toBe(RentSize.L);
    expect(rent.weight).toBe(7);
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
    expect(response.body.total).toBeGreaterThan(9); // Initial size: 9 elements
    expect(response.body.total).toBe(10); // Should have 10 elements now
    expect(response.body.data.length).toBe(10); // Length should match total
    let locker: Locker = response.body.data[9];
    expect(locker.bloqId).toBe(newLocker.bloqId);
    expect(locker.status).toBe(newLocker.status);
    expect(locker.isOccupied).toBe(newLocker.isOccupied);
  });
});

describe("PATCH /lockers/:id", () => {
  let locker = {
    status: LockerStatus.OPEN,
    isOccupied: false
  }

  it('updates Locker and responds with the Locker data', async () => {
    const response = await request(getApp()).patch("/lockers/1b8d1e89-2514-4d91-b813-044bf0ce8d20").send(locker);
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.length).toBe(1);
    let obj = response.body[0];
    expect(obj.status).toBe(locker.status);
  });

  it('responds with 404 Not Found when Bloq does not exist', async () => {
    const response = await request(getApp()).patch("/lockers/9ccf0e1c-0755-4f86-901e-9945c188ca33").send(locker)
    expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
  });
});

describe("DELETE /lockers/:id", () => {
  it('deletes Locker', async () => {
    const response = await request(getApp()).delete("/lockers/1b8d1e89-2514-4d91-b813-044bf0ce8d20");
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.text).toBe("locker has been removed")
  });

  it('responds with 404 Not Found when Locker does not exist', async () => {
    const response = await request(getApp()).patch("/lockers/9ccf0e1c-0755-4f86-901e-9945c188ca33");
    expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
  });
});

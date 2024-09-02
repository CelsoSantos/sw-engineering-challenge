import ExpressApp from "./app";
import { createExpressAppInstance, getExpressAppInstance } from "./appInstance";
import { Express } from "express";
import request from "supertest";
import { HttpStatusCode } from "./utils/HttpStatusCodes.enum";
import { initDb, initTestDb } from "./db/dbManager";
import { Bloq, LockerStatus, RentStatus } from "./models";

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
  initTestDb();
  // initDb();
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

describe('Creating a new Bloq with Lockers...', () => {
  it('should create Bloq AND Lockers at once, returning the Bloq and respective Lockers', async () => {
    let expected = {
      title: "My private Bloq",
      address: "At my house",
      lockers: [{
        status: LockerStatus.OPEN,
        isOccupied: false
      },
      {
        status: LockerStatus.OPEN,
        isOccupied: false
      },
      {
        status: LockerStatus.OPEN,
        isOccupied: false
      }]
    }
    const response = await request(getApp()).put("/bloqs/new").send(expected);
    expect(response.status).toBe(HttpStatusCode.OK);
    let actual = response.body;
    expect(actual.id).not.toBeNull();
    expect(actual.title).toBe(expected.title);
    expect(actual.address).toBe(expected.address);
    expect(actual.lockers.length).toBe(3);
  });
});

describe('Assigning rent to Locker...', () => {

  it('should fail if Locker is already occupied', async () => {
    const response = await request(getApp()).patch("/rents/50be06a8-1dec-4b18-a23c-e98588207752").send({ lockerId: "1b8d1e89-2514-4d91-b813-044bf0ce8d20" });
    expect(response.status).toBe(HttpStatusCode.NOT_MODIFIED);
  });

  it('should modify rent status to WAITING_DROPOFF', async () => {
    const response = await request(getApp()).patch("/rents/50be06a8-1dec-4b18-a23c-e98588207752").send({ lockerId: "8b4b59ae-8de5-4322-a426-79c29315a9f1" });
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.length).toBe(1);
    let actual = response.body[0];
    expect(actual.id).toBe("50be06a8-1dec-4b18-a23c-e98588207752");
    expect(actual.status).toBe(RentStatus.WAITING_DROPOFF);
  });
});

describe('Dropping off rent on Locker...', () => {
  let rent = {
    lockerId: "8b4b59ae-8de5-4322-a426-79c29315a9f1",
    status: RentStatus.WAITING_PICKUP
  }

  it('should modify rent status to WAITING_PICKUP AND assing a droppedAt date to the Rent', async () => {
    const response = await request(getApp()).patch("/rents/50be06a8-1dec-4b18-a23c-e98588207752").send(rent);
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.length).toBe(1);
    let actual = response.body[0];
    expect(actual.id).toBe("50be06a8-1dec-4b18-a23c-e98588207752");
    expect(actual.status).toBe(rent.status);
    expect(actual.droppedAt).not.toBeNull();
  });

  it('should modify Locker isOccupied property status to true', async () => {
    const response = await request(getApp()).patch("/lockers/8b4b59ae-8de5-4322-a426-79c29315a9f1").send(rent);
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.length).toBe(1);
    let actual = response.body[0];
    expect(actual.id).toBe("8b4b59ae-8de5-4322-a426-79c29315a9f1");
    expect(actual.isOccupied).toBeTruthy();
  });
});

describe('Picking up rent from Locker...', () => {
  let rent = {
    lockerId: "8b4b59ae-8de5-4322-a426-79c29315a9f1",
    status: RentStatus.DELIVERED
  }

  it('should modify rent status to DELIVERED AND assing a pickedUpAt date to the Rent', async () => {
    const response = await request(getApp()).patch("/rents/50be06a8-1dec-4b18-a23c-e98588207752").send(rent);
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.length).toBe(1);
    let actual = response.body[0];
    expect(actual.id).toBe("50be06a8-1dec-4b18-a23c-e98588207752");
    expect(actual.status).toBe(rent.status);
    expect(actual.pickedUpAt).not.toBeNull();
  });

  it('should modify Locker isOccupied property status to false', async () => {
    const response = await request(getApp()).patch("/lockers/8b4b59ae-8de5-4322-a426-79c29315a9f1").send(rent);
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.length).toBe(1);
    let actual = response.body[0];
    expect(actual.id).toBe("8b4b59ae-8de5-4322-a426-79c29315a9f1");
    expect(actual.isOccupied).toBeFalsy();
  });
});

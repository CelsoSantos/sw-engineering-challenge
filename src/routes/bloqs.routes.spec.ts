import ExpressApp from "../app";
import { createExpressAppInstance, getExpressAppInstance } from "../appInstance";
import { Express } from "express";
import request from "supertest";
import { HttpStatusCode } from "../utils/HttpStatusCodes.enum";
import { initTestDb } from "../db/dbManager";
import { Bloq, Locker, LockerStatus } from "../models";

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

/**
 * Bloqs Tests
 */

describe("GET /bloqs", () => {
  it('responds with a list of X <= 10 Bloqs, where 10 is the default page size, when per_page not given', async () => {
    const response = await request(getApp()).get("/bloqs")
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.page).toBe(1); // When ommited, page is always 1
    expect(response.body.per_page).toBe(10); // Default size: 10
    expect(response.body.total).toBe(3); // Initial size: 3 elements
    expect(response.body.data.length).toBe(3); // Length should match total
    let bloq: Bloq = response.body.data[0];
    expect(bloq.id).toBe("c3ee858c-f3d8-45a3-803d-e080649bbb6f");
  });

  it('responds with a list of X <= N Bloqs, where N is the given per_page size,', async () => {
    const response = await request(getApp()).get("/bloqs?page=1&per_page=20")
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.page).toBe(1);
    expect(response.body.per_page).toBe(20);
    expect(response.body.total).toBe(3); // Initial size: 3 elements
    expect(response.body.data.length).toBe(3); // Length should match total
    let bloq: Bloq = response.body.data[0];
    expect(bloq.id).toBe("c3ee858c-f3d8-45a3-803d-e080649bbb6f");
  });

  it('responds with an emtpy list Bloqs, when page greater than the existing number of Bloqs,', async () => {
    const response = await request(getApp()).get("/bloqs?page=2&per_page=10")
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.page).toBe(2);
    expect(response.body.per_page).toBe(10);
    expect(response.body.total).toBe(3); // Initial size: 3 elements
    expect(response.body.data.length).toBe(0); // Length should be 0 since we overshoot the number of items
  });

  it('responds with 400 Bad Request when page is not a number', async () => {
    const response = await request(getApp()).get("/bloqs?page=x&per_page=10")
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  it('responds with 400 Bad Request when per_page is not a number', async () => {
    const response = await request(getApp()).get("/bloqs?page=1&per_page=xx")
    expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
  });

  it('responds with 404 Not Found when Bloq does not exist', async () => {
    const response = await request(getApp()).get("/bloqs/8caacb43-ff81-49ea-b45a-62b8a3e9deb7")
    expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
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
  });
});

describe("PATCH /bloqs/:id", () => {
  let bloq = {
    title: "New Name",
    address: "New Address"
  }

  it('updates Bloq and responds with the Bloq data', async () => {
    const response = await request(getApp()).patch("/bloqs/484e01be-1570-4ac1-a2a9-02aad3acc54e").send(bloq);
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.length).toBe(1);
    let obj = response.body[0];
    expect(obj.title).toBe(bloq.title);
  });

  it('responds with 404 Not Found when Bloq does not exist', async () => {
    const response = await request(getApp()).patch("/bloqs/8caacb43-ff81-49ea-b45a-62b8a3e9deb7").send(bloq)
    expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
  });
});

describe("DELETE /bloqs/:id", () => {
  it('deletes Bloq', async () => {
    const response = await request(getApp()).delete("/bloqs/22ffa3c5-3a3d-4f71-81f1-cac18ffbc510");
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.text).toBe("bloq has been removed")
  });

  it('responds with 404 Not Found when Bloq does not exist', async () => {
    const response = await request(getApp()).patch("/bloqs/8caacb43-ff81-49ea-b45a-62b8a3e9deb7");
    expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
  });
});

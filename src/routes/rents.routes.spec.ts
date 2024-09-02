import ExpressApp from '../app';
import {
  createExpressAppInstance,
  getExpressAppInstance,
} from '../appInstance';
import { Express } from 'express';
import request from 'supertest';
import { HttpStatusCode } from '../utils/HttpStatusCodes.enum';
import { initTestDb } from '../db/dbManager';
import { Rent, RentSize, RentStatus } from '../models';

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
});

// beforeEach(async () => {
//   await startServer();
// })

// afterEach(async () => {
//   await shutdownServer();
// })

afterAll(async () => {
  await expressApp.stopServer();
});

export const getApp = (): Express => {
  return expressApp.app;
};

/**
 * Rents Tests
 */

describe('GET /rents', () => {
  it('responds with the X number of Rents, where X is the page size', async () => {
    const response = await request(getApp()).get('/rents');
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.page).toBe(1);
    expect(response.body.per_page).toBe(10); // Default size: 10
    expect(response.body.total).toBe(4); // Initial size: 4 elements
    expect(response.body.data.length).toBe(4); // Length should match total
    let rent: Rent = response.body.data[0];
    expect(rent.id).toBe('50be06a8-1dec-4b18-a23c-e98588207752');
  });

  it('responds with the requested Rent detailed information', async () => {
    const response = await request(getApp()).get(
      '/rents/50be06a8-1dec-4b18-a23c-e98588207752',
    );
    expect(response.status).toBe(HttpStatusCode.OK);
    let rent: Rent = response.body;
    expect(rent.id).toBe('50be06a8-1dec-4b18-a23c-e98588207752');
    // expect(rent.lockerId).toBeNull();
    expect(rent.weight).toBe(5);
    expect(rent.size).toBe(RentSize.M);
    expect(rent.status).toBe(RentStatus.CREATED);
  });
});

describe('PUT /rents/new', () => {
  let newRent = {
    weight: 10,
    size: RentSize.S,
  };

  it('adds a new Rent and responds with the Rent data', async () => {
    const response = await request(getApp()).put('/rents/new').send(newRent);
    expect(response.status).toBe(HttpStatusCode.OK);
    let rent: Rent = response.body;
    // expect(rent.lockerId).toBe(newRent.lockerId);
    expect(rent.weight).toBe(newRent.weight);
    expect(rent.size).toBe(newRent.size);
    expect(rent.status).toBe(RentStatus.CREATED);
  });

  it('responds with the X number of Rents, including the new Rent', async () => {
    const response = await request(getApp()).get('/rents');
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.page).toBe(1);
    expect(response.body.per_page).toBe(10); // Default size: 10
    expect(response.body.total).toBeGreaterThan(4); // Initial size: 4 elements
    expect(response.body.total).toBe(5); // Should have 5 elements now
    expect(response.body.data.length).toBe(5); // Length should match total
    let rent: Rent = response.body.data[4];
    // expect(rent.lockerId).toBe(newRent.lockerId);
    expect(rent.weight).toBe(newRent.weight);
    expect(rent.size).toBe(newRent.size);
    expect(rent.status).toBe(RentStatus.CREATED);
  });
});

describe('PATCH /rents/:id', () => {
  let rent = {
    lockerId: 'ea6db2f6-2da7-42ed-9619-d40d718b7bec',
    weight: 10,
    size: RentSize.S,
    status: RentStatus.WAITING_DROPOFF,
    droppedAt: Date.now(),
  };

  it('updates Rent and responds with the Rent data', async () => {
    const response = await request(getApp())
      .patch('/rents/40efc6fd-f10c-4561-88bf-be916613377c')
      .send(rent);
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.body.length).toBe(1);
    let obj = response.body[0];
    expect(obj.status).toBe(rent.status);
  });

  it('responds with 404 Not Found when Rent does not exist', async () => {
    const response = await request(getApp())
      .patch('/rents/f4f9634d-915f-404a-b687-f2c6bc82cd08')
      .send(rent);
    expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
  });
});

describe('DELETE /rents/:id', () => {
  it('deletes Rent', async () => {
    const response = await request(getApp()).delete(
      '/rents/40efc6fd-f10c-4561-88bf-be916613377c',
    );
    expect(response.status).toBe(HttpStatusCode.OK);
    expect(response.text).toBe('rent has been removed');
  });

  it('responds with 404 Not Found when Rent does not exist', async () => {
    const response = await request(getApp()).patch(
      '/rents/f4f9634d-915f-404a-b687-f2c6bc82cd08',
    );
    expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
  });
});

import {
  bloqCollection,
  destroyTestDb,
  initTestDb,
  lockerCollection,
  rentCollection,
  testPopulateBloqs,
} from './dbManager';

// beforeAll(() => {
//   initTestDb();
// })

// afterAll(() => {
//   destroyTestDb();
// })

describe('DB Tests', () => {
  it('Initializes Test DB correctly', () => {
    let dbModule = jest.requireActual('./dbManager');
    let pushBloqsMethod = jest.spyOn(dbModule, 'testPopulateBloqs');
    let pushLockersMethod = jest.spyOn(dbModule, 'testPopulateLockers');
    let pushRentsMethod = jest.spyOn(dbModule, 'testPopulateRents');

    initTestDb();

    expect(pushBloqsMethod).toHaveBeenCalled();
    expect(pushLockersMethod).toHaveBeenCalled();
    expect(pushRentsMethod).toHaveBeenCalled();
    expect(bloqCollection.length).toBeGreaterThan(0);
    expect(lockerCollection.length).toBeGreaterThan(0);
    expect(rentCollection.length).toBeGreaterThan(0);
  });

  it('Destroys Test DB correctly', () => {
    destroyTestDb();
    expect(bloqCollection.length).toBe(0);
    expect(lockerCollection.length).toBe(0);
    expect(rentCollection.length).toBe(0);
  });
});

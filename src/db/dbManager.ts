import fs from "fs";
import { Bloq, Locker, Rent } from "../models";

const rentsFile = __dirname + "/data/rents.json";
const bloqsFile = __dirname + "/data/bloqs.json";
const lockersFile = __dirname + "/data/lockers.json";

const testRentsFile = __dirname + "/data/test/rents.json";
const testBloqsFile = __dirname + "/data/test/bloqs.json";
const testLockersFile = __dirname + "/data/test/lockers.json";

// const bloqs: ;
export let bloqCollection: Bloq[] = [];
export let lockerCollection: Locker[] = [];
export let rentCollection: Rent[] = [];

const populateBloqs = (filepath: string) => {
  let bloqs = fs.readFileSync(filepath, { encoding: "utf8" });
  JSON.parse(bloqs).forEach((bloq: Bloq) => {
    bloqCollection.push(new Bloq(bloq.id, bloq.title, bloq.address))
  });
}

const populateLockers = (filepath: string) => {
  let lockers = fs.readFileSync(filepath, { encoding: "utf8" });
  JSON.parse(lockers).forEach((locker: Locker) => {
    lockerCollection.push(new Locker(locker.id, locker.bloqId, locker.status, locker.isOccupied))
  })
}

const populateRents = (filepath: string) => {
  let rents = fs.readFileSync(filepath, { encoding: "utf8" });
  JSON.parse(rents).forEach((rent: Rent) => {
    rentCollection.push(new Rent(rent.id, rent.lockerId, rent.weight, rent.size, rent.status))
  });
}

export const initDb = () => {
  populateBloqs(bloqsFile);
  populateLockers(lockersFile);
  populateRents(rentsFile);

  listenChangesinArray(bloqCollection, writeFile);
  listenChangesinArray(lockerCollection, writeFile);
  listenChangesinArray(rentCollection, writeFile);
}

export const initTestDb = () => {
  testPopulateBloqs();
  testPopulateLockers();
  testPopulateRents();
}

export const testPopulateBloqs = () => {
  populateBloqs(testBloqsFile);
}

export const testPopulateLockers = () => {
  populateLockers(testLockersFile);
}

export const testPopulateRents = () => {
  populateRents(testRentsFile);
}

export const destroyTestDb = () => {
  bloqCollection = [];
  lockerCollection = [];
  rentCollection = [];
}

/* @arr array you want to listen to
   @callback function that will be called on any change inside array
 */
const listenChangesinArray = (arr: any, callback: any) => {
  // Add more methods here if you want to listen to them
  ['pop', 'push', 'splice', 'sort'].forEach((m: any) => {
    arr[m] = (...args: any) => {
      var res = Array.prototype[m].apply(arr, args);  // call normal behaviour
      if (args[0] instanceof Bloq) {
        callback.apply(arr, [bloqsFile, bloqCollection]);  // finally call the callback supplied
      }
      if (args[0] instanceof Locker) {
        callback.apply(arr, [lockersFile, lockerCollection]);  // finally call the callback supplied
      }
      if (args[0] instanceof Rent) {
        callback.apply(arr, [rentsFile, rentCollection]);  // finally call the callback supplied
      }
      if (m === 'splice' && arr[0] instanceof Bloq) { // Check first element type and assume the type from there
        callback.apply(arr, [bloqsFile, bloqCollection]);  // finally call the callback supplied
      }
      if (m === 'splice' && arr[0] instanceof Locker) { // Check first element type and assume the type from there
        callback.apply(arr, [lockersFile, lockerCollection]);  // finally call the callback supplied
      }
      if (m === 'splice' && arr[0] instanceof Rent) { // Check first element type and assume the type from there
        callback.apply(arr, [rentsFile, rentCollection]);  // finally call the callback supplied
      }
      return res;
    }
  });
}

const writeFile = (...args: any) => {
  try {
    fs.writeFileSync(args[0], JSON.stringify(args[1], null, 2), 'utf8');
    console.log('Data successfully saved to disk');
  } catch (error) {
    console.log('An error has occurred ', error);
  }
}

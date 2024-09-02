import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { lockerCollection } from "../db/dbManager";
import { HttpStatusCode } from "../utils/HttpStatusCodes.enum";
import { Locker, LockerStatus, Rent } from "../models";
import { RentsController } from "./rents.controller";

export class LockersController {
  list = async (request: Request, response: Response) => {
    let page: number = 1;
    let per_page: number = 10;
    // let filter: FilterOptions = {};

    if (request.query.page) {
      page = parseInt(request.query.page?.toString());
      page = (page == 0) ? 1 : page;
    }

    if (request.query.per_page) {
      per_page = parseInt(request.query.per_page?.toString());
    }

    if (isNaN(page) || isNaN(per_page)) {
      return response.status(HttpStatusCode.BAD_REQUEST).send("Bad Request");
    }

    if (request.query.filter) {

    }

    const skipItems = (page - 1) * per_page;

    // let lockers = lockerCollection.slice(skipItems).slice(0, per_page);
    let lockers = lockerCollection.slice(skipItems, per_page);
    let resp = {
      page: page,
      per_page: per_page,
      total: lockerCollection.length,
      data: lockers
    }
    return response.status(HttpStatusCode.OK).send(resp);
  }

  getById = async (request: Request, response: Response) => {
    const lockerId = request.params.id;
    // if (!UUID.isValid(id)) {
    //   return response.status(400).send("locker ID")
    // }

    const locker = LockersController.findById(lockerId);
    if (!locker) {
      return response.status(HttpStatusCode.NOT_FOUND).send("unregistered locker");
    }
    let result: Object = {
      ...locker
    }

    const includeRents: boolean = Boolean(request.query.rents?.toString());
    let rents: Rent[] = [];
    if (includeRents) {
      rents = RentsController.findByLockerId(locker.id);
      result = {
        ...locker,
        rents: rents
      }
    }

    return response.status(HttpStatusCode.OK).send(result);
  }

  save = async (request: Request, response: Response) => {
    const { bloqId, status, isOccupied } = request.body;

    const locker: Locker = new Locker(randomUUID(), bloqId, status, isOccupied);

    try {
      const index = lockerCollection.push(locker);
      return response.status(HttpStatusCode.OK).send(lockerCollection.at(index - 1));
    } catch (error) {
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error);
    }
  }

  update = async (request: Request, response: Response) => {
    const lockerId = request.params.id;
    const { id, bloqId, status, isOccupied } = request.body;

    let locker = LockersController.findById(lockerId);
    let lockerIdx = LockersController.getIndexById(lockerId);

    if (!locker || lockerIdx < 0) {
      return response.status(HttpStatusCode.NOT_FOUND).send("unregistered locker");
    } else {
      // Let's assume one can't change a Locker from a Bloq
      // As such, a BloqId is always ignored and never modified
      if (status == LockerStatus.CLOSED || status == LockerStatus.OPEN) {
        locker.status = status;
      }
      if (isOccupied) {
        locker.isOccupied = isOccupied
      }
    }

    try {
      const result = lockerCollection.splice(lockerIdx, 1, locker);
      return response.status(HttpStatusCode.OK).send(result);
    } catch (error) {
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error);
    }
  }

  delete = async (request: Request, response: Response) => {
    const lockerId = request.params.id;
    // if (!UUID.isValid(id)) {
    //   response.status(400).send("locker ID")
    // }

    let lockerToRemove = LockersController.findById(lockerId);
    if (!lockerToRemove) {
      return response.status(HttpStatusCode.NOT_FOUND).send("unregistered locker");
    }
    try {
      let idx = LockersController.getIndexById(lockerToRemove.id);
      if (idx >= -1) {
        lockerCollection.splice(idx, 1);
      }
      return response.status(HttpStatusCode.OK).send("locker has been removed");
    } catch (error) {
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error);
    }
  }

  static findById = (id: string) => {
    return lockerCollection.find((locker: Locker) => {
      return locker.id === id;
    });
  }

  static getIndexById = (id: string) => {
    return lockerCollection.map((locker) => {
      return locker.id;
    }).indexOf(id);
  }

  static findByBloqId = (bloqId: string) => {
    return lockerCollection.filter((locker: Locker) => {
      return locker.bloqId === bloqId;
    });
  }

  static findEmpty = () => {
    return lockerCollection.filter((locker: Locker) => {
      return locker.isOccupied === false;
    })
  }

  static modifyStatus = (id: string, status: LockerStatus) => {
    let locker = lockerCollection.find((locker: Locker) => {
      return locker.id === id;
    });
    let idx = -1;
    if (locker) {
      idx = LockersController.getIndexById(locker.id)
      if (idx >= 0) {
        locker.status = status;
        lockerCollection.splice(idx, 1, locker);
      }
    }
  }

  static modifyOccupation = (id: string, isOccupied: boolean) => {
    let locker = lockerCollection.find((locker: Locker) => {
      return locker.id === id;
    });
    let idx = -1;
    if (locker) {
      idx = LockersController.getIndexById(locker.id)
      if (idx >= 0) {
        locker.isOccupied = isOccupied;
        lockerCollection.splice(idx, 1, locker);
      }
    }
  }
}

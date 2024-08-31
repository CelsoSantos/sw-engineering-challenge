import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { lockerCollection } from "../db/dbManager";
import { HttpStatusCode } from "../utils/HttpStatusCodes.enum";
import { Locker, LockerStatus } from "../models";

export class LockersController {
  list = async (request: Request, response: Response) => {
    let page: number = 1;
    let per_page: number = 10;

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

    const skipItems = (page - 1) * per_page;

    let items = lockerCollection.slice(skipItems).slice(0, per_page);
    let resp = {
      page: page,
      per_page: per_page,
      total: lockerCollection.length,
      data: items
    }
    return response.status(HttpStatusCode.OK).send(resp);
  }

  getById = async (request: Request, response: Response) => {
    const lockerId = request.params.id;
    // if (!UUID.isValid(id)) {
    //   return response.status(400).send("bloq ID")
    // }

    const locker = this.findById(lockerId);
    if (!locker) {
      return response.status(HttpStatusCode.NOT_FOUND).send("unregistered locker");
    }
    return response.status(HttpStatusCode.OK).send(locker);
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

    let locker = this.findById(lockerId);
    let lockerIdx = this.getIndexById(lockerId);

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

    let lockerToRemove = this.findById(lockerId);
    if (!lockerToRemove) {
      return response.status(HttpStatusCode.NOT_FOUND).send("unregistered locker");
    }
    try {
      let idx = this.getIndexById(lockerToRemove.id);
      if (idx >= -1) {
        lockerCollection.splice(idx, 1);
      }
      return response.status(HttpStatusCode.OK).send("locker has been removed");
    } catch (error) {
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error);
    }
  }

  private findById = (id: string) => {
    return lockerCollection.find((locker: Locker) => {
      return locker.id === id;
    });
  }

  private getIndexById = (id: string) => {
    return lockerCollection.map((locker) => {
      return locker.id;
    }).indexOf(id);
  }

  static findByBloqId = (bloqId: string) => {
    return lockerCollection.filter((locker: Locker) => {
      return locker.bloqId === bloqId;
    });
  }
}

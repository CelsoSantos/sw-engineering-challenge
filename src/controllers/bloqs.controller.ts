import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { bloqCollection, lockerCollection } from "../db/dbManager";
import { HttpStatusCode } from "../utils/HttpStatusCodes.enum";
import { Bloq, Locker } from "../models";
import { LockersController } from "./lockers.controller";

export class BloqsController {
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

    let items = bloqCollection.slice(skipItems).slice(0, per_page);
    let resp = {
      page: page,
      per_page: per_page,
      total: bloqCollection.length,
      data: items
    }
    return response.status(HttpStatusCode.OK).send(resp);
  }

  getById = async (request: Request, response: Response) => {
    const bloqId = request.params.id;
    // if (!UUID.isValid(id)) {
    //   return response.status(400).send("bloq ID")
    // }

    const bloq = this.findById(bloqId);
    if (!bloq) {
      return response.status(HttpStatusCode.NOT_FOUND).send("unregistered bloq");
    }
    let result: Object = {
      ...bloq
    }

    const includeLockers: boolean = Boolean(request.query.lockers?.toString());
    let lockers: Locker[] = [];
    if (includeLockers) {
      lockers = LockersController.findByBloqId(bloq.id);
      result = {
        ...bloq,
        lockers: lockers
      }
    }

    return response.status(HttpStatusCode.OK).send(result);
  }

  save = async (request: Request, response: Response) => {
    const { title, address, lockers } = request.body;
    let result: any = {};

    let bloqId = randomUUID();
    const bloq: Bloq = new Bloq(bloqId, title, address);
    result = {
      ...bloq
    }
    
    let newLockers: Locker[] = [];
    if (lockers && lockers.length >= 0) {
      lockers.forEach((locker: Locker) => {
        newLockers.push(new Locker(randomUUID(), bloqId, locker.status, locker.isOccupied))
      });
    }

    try {
      const index = bloqCollection.push(bloq);
      if (index >= 0 && newLockers.length >= 0) {
        lockerCollection.push(...newLockers);
        result = {
          ...bloq,
          lockers: LockersController.findByBloqId(bloq.id)
        }
      }
      return response.status(HttpStatusCode.OK).send(result);
    } catch (error) {
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error);
    }
  }

  update = async (request: Request, response: Response) => {
    const bloqId = request.params.id;
    const { id, title, address } = request.body;

    let bloq = this.findById(bloqId);
    let bloqIdx = this.getIndexById(bloqId);

    if (!bloq || bloqIdx < 0) {
      return response.status(HttpStatusCode.NOT_FOUND).send("unregistered bloq");
    } else {
      if (address) {
        bloq.address = address
      }
      if (title) {
        bloq.title = title;
      }
    }

    try {
      const result = bloqCollection.splice(bloqIdx, 1, bloq);
      return response.status(HttpStatusCode.OK).send(result);
    } catch (error) {
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error);
    }
  }

  delete = async (request: Request, response: Response) => {
    const bloqId = request.params.id;
    // if (!UUID.isValid(id)) {
    //   response.status(400).send("bloq ID")
    // }

    let bloqToRemove = this.findById(bloqId);
    if (!bloqToRemove) {
      return response.status(HttpStatusCode.NOT_FOUND).send("unregistered bloq");
    }
    try {
      let idx = this.getIndexById(bloqToRemove.id);
      if (idx >= -1) {
        bloqCollection.splice(idx, 1);
      }
      return response.status(HttpStatusCode.OK).send("bloq has been removed");
    } catch (error) {
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error);
    }
  }

  private findById = (id: string) => {
    return bloqCollection.find((bloq: Bloq) => {
      return bloq.id === id;
    });
  }

  private getIndexById = (id: string) => {
    return bloqCollection.map((bloq) => {
      return bloq.id;
    }).indexOf(id);
  }

  static findByTitle = (title: string) => {
    return bloqCollection.filter((bloq: Bloq) => {
      return bloq.title.includes(title);
    });
  }
}

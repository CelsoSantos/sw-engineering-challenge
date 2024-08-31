import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { lockerCollection, rentCollection } from "../db/dbManager";
import { HttpStatusCode } from "../utils/HttpStatusCodes.enum";
import { Rent, RentStatus } from "../models";

export class RentsController {
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

    let items = rentCollection.slice(skipItems).slice(0, per_page);
    let resp = {
      page: page,
      per_page: per_page,
      total: rentCollection.length,
      data: items
    }
    return response.status(HttpStatusCode.OK).send(resp);
  }

  getById = async (request: Request, response: Response) => {
    const rentId = request.params.id;
    // if (!UUID.isValid(id)) {
    //   return response.status(400).send("rent ID")
    // }

    const rent = this.findById(rentId);
    if (!rent) {
      return response.status(HttpStatusCode.NOT_FOUND).send("unregistered rent");
    }
    return response.status(HttpStatusCode.OK).send(rent);
  }

  save = async (request: Request, response: Response) => {
    const { lockerId, weight, size, status } = request.body;

    const rent: Rent = new Rent(randomUUID(), lockerId, weight, size, status);

    try {
      const index = rentCollection.push(rent);
      return response.status(HttpStatusCode.OK).send(rentCollection.at(index - 1));
    } catch (error) {
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error);
    }
  }

  update = async (request: Request, response: Response) => {
    const rentId = request.params.id;
    const { id, lockerId, weight, size, status, createdAt, droppedAt, pickedUpAt } = request.body;

    let rent = this.findById(rentId);
    let rentIdx = this.getIndexById(rentId);

    if (!rent || rentIdx < 0) {
      return response.status(HttpStatusCode.NOT_FOUND).send("unregistered rent");
    } else {
      if (lockerId) {
        rent.lockerId = lockerId;
      }
      if (weight) {
        rent.weight = weight;
      }
      if (size) {
        rent.size = size;
      }
      if (status in RentStatus) {
        rent.status = status;
      }
      if (createdAt) {
        rent.createdAt = createdAt;
      }
      if (droppedAt) {
        rent.droppedAt = droppedAt;
      }
      if (pickedUpAt) {
        rent.pickedUpAt = pickedUpAt;
      }
    }

    try {
      const result = rentCollection.splice(rentIdx, 1, rent);
      return response.status(HttpStatusCode.OK).send(result);
    } catch (error) {
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error);
    }
  }

  delete = async (request: Request, response: Response) => {
    const rentId = request.params.id;
    // if (!UUID.isValid(id)) {
    //   response.status(400).send("rent ID")
    // }

    let rentToRemove = this.findById(rentId);
    if (!rentToRemove) {
      return response.status(HttpStatusCode.NOT_FOUND).send("unregistered rent");
    }
    try {
      let idx = this.getIndexById(rentToRemove.id);
      if (idx >= -1) {
        rentCollection.splice(idx, 1);
      }
      return response.status(HttpStatusCode.OK).send("rent has been removed");
    } catch (error) {
      return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).send(error);
    }
  }

  private findById = (id: string) => {
    return rentCollection.find((rent: Rent) => {
      return rent.id === id;
    });
  }

  private getIndexById = (id: string) => {
    return rentCollection.map((rent) => {
      return rent.id;
    }).indexOf(id);
  }

  static findByLockerId = (lockerId: string) => {
    return rentCollection.filter((rent: Rent) => {
      return rent.lockerId === lockerId;
    });
  }
}

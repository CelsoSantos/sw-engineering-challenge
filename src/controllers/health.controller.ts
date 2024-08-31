import express from "express";
import { HttpStatusCode } from "../utils/HttpStatusCodes.enum";

export const healthCheck = async (_req: express.Request, res: express.Response) => {
  res.status(HttpStatusCode.OK).send(`OK`);
}

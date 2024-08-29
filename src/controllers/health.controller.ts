import express from "express";

export const healthCheck = async (_req: express.Request, res: express.Response) => {
  res.status(200).send(`OK`);
}

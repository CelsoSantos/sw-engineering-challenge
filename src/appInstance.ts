import ExpressApp from "./app";

let expressAppInstance: ExpressApp;

export const createExpressAppInstance = (): ExpressApp => {
  expressAppInstance = new ExpressApp();
  return expressAppInstance;
};

export const getExpressAppInstance = (): ExpressApp => expressAppInstance;

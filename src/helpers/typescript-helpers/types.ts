import { Request, Response, NextFunction } from "express";

export type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => any;

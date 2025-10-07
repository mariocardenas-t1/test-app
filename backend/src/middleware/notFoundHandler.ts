import { type Request, type Response } from "express";

const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ error: { message: "Resource not found" } });
};

export default notFoundHandler;

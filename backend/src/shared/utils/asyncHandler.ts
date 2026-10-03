import type { Request, Response, NextFunction } from "express";

const asyncHandler = <TRequest extends Request = Request> (
  fn: (
    req: TRequest,
    res: Response,
    next: NextFunction
  ) => Promise<void>
) => 
(
  req: TRequest,
  res: Response,
  next: NextFunction
): void => {
  Promise.resolve(fn(req, res, next))
    .catch(next);
};

export default asyncHandler;
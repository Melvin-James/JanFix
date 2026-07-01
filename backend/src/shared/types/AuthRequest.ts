import type { Request } from "express";
import type { Role } from "../../domain/enums/Role.js";

export interface AuthRequest
  extends Request {

  user?: {

    userId: string;

    roles: Role[];
  };
}
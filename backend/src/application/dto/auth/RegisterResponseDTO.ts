import { Role } from "../../../domain/enums/Role.js";

export interface RegisterResponseDTO {
  id: string;

  fullName: string;

  email: string;

  roles: Role[];

  isVerified: boolean;
}
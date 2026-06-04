import { Role } from "../../../domain/enums/Role.js";

export interface RegisterResponseDTO {
  id: string;

  name: string;

  email: string;

  role: Role;

  isVerified: boolean;
}
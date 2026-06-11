import { Role } from "../../../domain/enums/Role.js";

export interface RegisterUserDTO {

    email: string;

    password: string;

    confirmPassword: string;

    role: Role;
}
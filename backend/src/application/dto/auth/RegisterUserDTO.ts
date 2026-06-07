import { Role } from "../../../domain/enums/Role.js";

export interface RegisterUserDTO {

    name?: string;

    email: string;

    password: string;

    confirmPassword: string;

    role: Role;
}
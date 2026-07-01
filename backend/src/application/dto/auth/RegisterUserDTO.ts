import { Role } from "../../../domain/enums/Role.js";

export interface RegisterUserDTO {

    fullName: string;

    email: string;

    password: string;

    confirmPassword: string;
}
import { Role } from "../enums/Role.js";

export interface User {
    id?: string;
    name?: string;
    email: string;
    password: string;
    role: Role;
    isVerified: boolean;
}
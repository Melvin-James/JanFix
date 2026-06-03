import bcrypt from "bcryptjs";

import type { RegisterUserDTO } from "../../dto/auth/RegisterUserDTO.js";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import { Role } from "../../../domain/enums/Role.js";
import type { User } from "../../../domain/entities/User.js";
import ApiError from "../../../shared/utils/apiError.js";

export class RegisterUserUseCase {

    constructor(private userRepository: IUserRepository) { }

    async execute(dto: RegisterUserDTO): Promise<User> {

        const existingUser = await this.userRepository.findByEmail(dto.email);

        if (existingUser) {
            throw new ApiError(409,"User already exists");
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user: User = {
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
            role: Role.USER,
            isVerified: false,
        };

        const createdUser = await this.userRepository.create(user);

        return createdUser;
    }
}
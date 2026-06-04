import type { Request, Response } from "express";

import asyncHandler from "../../../shared/utils/asyncHandler.js";

import type { RegisterUserDTO } from "../../../application/dto/auth/RegisterUserDTO.js";

import { RegisterUserUseCase } from "../../../application/use-cases/auth/RegisterUserUseCase.js";

import { UserRepository } from "../../../infrastructure/repositories/UserRepository.js";

import EmailService from "../../../infrastructure/services/EmailService.js";

const userRepository = new UserRepository();

const emailService = new EmailService();

const registerUserUseCase = new RegisterUserUseCase(
   userRepository,
   emailService
)

export const register = asyncHandler(
    async (
        req: Request,
        res: Response
    ): Promise<void> => {


        const dto: RegisterUserDTO = req.body;

        const createdUser = await registerUserUseCase.execute(dto);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: createdUser.id,
                name: createdUser.name,
                email: createdUser.email,
                role: createdUser.role,
            },
        });
    });
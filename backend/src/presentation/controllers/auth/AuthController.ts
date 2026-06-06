import type { Request, Response } from "express";

import asyncHandler from "../../../shared/utils/asyncHandler.js";

import type { RegisterUserDTO } from "../../../application/dto/auth/RegisterUserDTO.js";

import { RegisterUserUseCase } from "../../../application/use-cases/auth/RegisterUserUseCase.js";

import { UserRepository } from "../../../infrastructure/repositories/UserRepository.js";

import EmailService from "../../../infrastructure/services/EmailService.js";

import type { VerifyOtpDTO } from "../../../application/dto/auth/VerifyOtpDTO.js";

import { VerifyOtpUseCase } from "../../../application/use-cases/auth/VerifyOtpUseCase.js";

import { RedisOtpRepository } from "../../../infrastructure/repositories/RedisOtpRepository.js";

const userRepository = new UserRepository();

const otpRepository = new RedisOtpRepository();

const verifyOtpUseCase = new VerifyOtpUseCase(userRepository, otpRepository);

export const register = asyncHandler(
  async (
    req: Request,
    res: Response
  ): Promise<void> => {


    const dto: RegisterUserDTO = req.body;

    const userRepository =
      new UserRepository();

    const emailService =
      new EmailService();

    const registerUserUseCase =
      new RegisterUserUseCase(
        userRepository,
        otpRepository,
        emailService
      );

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

export const verifyOtp = asyncHandler(
  async (
    req: Request,
    res: Response
  ): Promise<void> => {

    const dto: VerifyOtpDTO = req.body;

    await verifyOtpUseCase.execute(dto);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  }
);
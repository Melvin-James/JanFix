import type { Request, Response } from "express";

import asyncHandler from "../../../shared/utils/asyncHandler.js";

import type { RegisterUserDTO } from "../../../application/dto/auth/RegisterUserDTO.js";

import { RegisterUserUseCase } from "../../../application/use-cases/auth/RegisterUserUseCase.js";

import { UserRepository } from "../../../infrastructure/repositories/UserRepository.js";

import EmailService from "../../../infrastructure/services/EmailService.js";

import type { VerifyOtpDTO } from "../../../application/dto/auth/VerifyOtpDTO.js";

import { VerifyOtpUseCase } from "../../../application/use-cases/auth/VerifyOtpUseCase.js";

import { RedisOtpRepository } from "../../../infrastructure/repositories/RedisOtpRepository.js";

import type { LoginDTO } from "../../../application/dto/auth/LoginDTO.js";

import { LoginUseCase } from "../../../application/use-cases/auth/LoginUseCase.js";

import JwtService from "../../../infrastructure/services/JwtService.js";

import { setAuthCookies } from "../../../shared/utils/setAuthCookies.js";

import { RefreshTokenUseCase } from "../../../application/use-cases/auth/RefreshTokenUseCase.js";
import ApiError from "../../../shared/utils/apiError.js";

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

export const login = asyncHandler(

  async (
    req: Request,
    res: Response
  ): Promise<void> => {

    const dto: LoginDTO = req.body;

    const userRepository = new UserRepository();

    const jwtService = new JwtService();

    const loginUseCase = new LoginUseCase(userRepository, jwtService);

    const result = await loginUseCase.execute(dto);

    setAuthCookies(res, result.refreshToken);

    res.status(200).json({

      success: true,

      message: "Login successful",

      data: {

        accessToken:
          result.accessToken,

        user: result.user,
      },
    });
  }
);

export const refreshToken = asyncHandler(

  async (req: Request, res: Response): Promise<void> => {

    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }

    const jwtService = new JwtService();

    const userRepository = new UserRepository();

    const refreshTokenUseCase = new RefreshTokenUseCase(jwtService, userRepository);

    const newAccessToken = await refreshTokenUseCase.execute(refreshToken);

    res.status(200).json({

      success: true,

      message: "Access token refreshed",

      data: {
        accessToken:
          newAccessToken,
      },
    });

  }
);

export const logout = asyncHandler(

  async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie(

      "refreshToken",

      {

        httpOnly: true,

        secure: false,

        sameSite: "strict",
      }
    );

    res.status(200).json({

      success: true,

      message:
        "Logged out successfully",
    });
  }
);
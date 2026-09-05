import type { Request, Response } from "express";
import asyncHandler from "../../../shared/utils/asyncHandler.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { AppMessages } from "../../../shared/constants/messages.js";
import type { RegisterUserDTO } from "../../../application/dto/auth/RegisterUserDTO.js";
import type { VerifyOtpDTO } from "../../../application/dto/auth/VerifyOtpDTO.js";
import type { LoginDTO } from "../../../application/dto/auth/LoginDTO.js";
import { setAuthCookies } from "../../../shared/utils/setAuthCookies.js";
import ApiError from "../../../shared/utils/apiError.js";
import type{ IGoogleAuthService } from "../../../domain/interface/IGoogleAuthService.js";

// Use Cases
import type { IRegisterUserUseCase } from "../../../application/use-cases/usecase interfaces/IRegisterUserUseCase.js";
import type { IVerifyOtpUseCase } from "../../../application/use-cases/usecase interfaces/IVerifyOtpUseCase.js";
import type { ILoginUseCase } from "../../../application/use-cases/usecase interfaces/ILoginUseCase.js";
import type { IRefreshTokenUseCase } from "../../../application/use-cases/usecase interfaces/IRefreshTokenUseCase.js";
import type { IGoogleAuthUseCase } from "../../../application/use-cases/usecase interfaces/IGoogleAuthUseCase.js";

export class AuthController {
  constructor(
    private registerUserUseCase: IRegisterUserUseCase,
    private verifyOtpUseCase: IVerifyOtpUseCase,
    private loginUseCase: ILoginUseCase,
    private refreshTokenUseCase: IRefreshTokenUseCase,
    private googleAuthUseCase: IGoogleAuthUseCase,
    private googleAuthService: IGoogleAuthService,
  ) { }

  public register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto: RegisterUserDTO = req.body;
    const createdUser = await this.registerUserUseCase.execute(dto);

    res.status(HttpStatusCode.CREATED).json({
      success: true,
      message: AppMessages.SUCCESS.USER_REGISTERED,
      data: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
      },
    });
  });

  public googleAuth = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {

      const {credential} = req.body;

      console.log("Google credential exists:", !!credential);

      const googleUser = await this.googleAuthService.verifyCredential(credential);

      const result = await this.googleAuthUseCase.execute(googleUser);

      setAuthCookies(res, result.refreshToken);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: AppMessages.SUCCESS.LOGIN_SUCCESSFUL,
        data: {
          accessToken: result.accessToken,
          user: result.user,
        },
      });
    }
  );

  public verifyOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto: VerifyOtpDTO = req.body;
    await this.verifyOtpUseCase.execute(dto);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: AppMessages.SUCCESS.OTP_VERIFIED,
    });
  });

  public login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto: LoginDTO = req.body;
    const result = await this.loginUseCase.execute(dto);

    setAuthCookies(res, result.refreshToken);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: AppMessages.SUCCESS.LOGIN_SUCCESSFUL,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  });

  public refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.REFRESH_TOKEN_MISSING);
    }

    const result = await this.refreshTokenUseCase.execute(refreshToken);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: AppMessages.SUCCESS.TOKEN_REFRESHED,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  });

  public logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false, // Update to true in production if HTTPS
      sameSite: "strict",
    });

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: AppMessages.SUCCESS.LOGGED_OUT,
    });
  });
}
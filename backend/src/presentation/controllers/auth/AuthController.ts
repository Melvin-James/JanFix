import type { Request, Response } from "express";
import asyncHandler from "../../../shared/utils/asyncHandler.js";

import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { AppMessages } from "../../../shared/constants/messages.js";

import type { RegisterUserDTO } from "../../../application/dto/auth/RegisterUserDTO.js";
import type { VerifyOtpDTO } from "../../../application/dto/auth/VerifyOtpDTO.js";
import type { LoginDTO } from "../../../application/dto/auth/LoginDTO.js";
import type { ForgotPasswordDTO } from "../../../application/dto/auth/ForgotPasswordDTO.js";
import type { ResetPasswordDTO } from "../../../application/dto/auth/ResetPasswordDTO.js";
import type { ResendOtpDTO } from "../../../application/dto/auth/ResendOtpDTO.js";


import { setAuthCookies } from "../../../shared/utils/setAuthCookies.js";
import { setAccessTokenCookie } from "../../../shared/utils/setAccessTokenCookie.js";
import { clearAuthCookies } from "../../../shared/utils/clearAuthCookies.js";


import type { IGoogleAuthService } from "../../../domain/interface/IGoogleAuthService.js";

// Use Cases
import type { IRegisterUserUseCase } from "../../../application/use-cases/usecase interfaces/auth/IRegisterUserUseCase.js";
import type { IVerifyOtpUseCase } from "../../../application/use-cases/usecase interfaces/auth/IVerifyOtpUseCase.js";
import type { ILoginUseCase } from "../../../application/use-cases/usecase interfaces/auth/ILoginUseCase.js";
import type { IRefreshTokenUseCase } from "../../../application/use-cases/usecase interfaces/auth/IRefreshTokenUseCase.js";
import type { IGoogleAuthUseCase } from "../../../application/use-cases/usecase interfaces/auth/IGoogleAuthUseCase.js";
import type { IForgotPasswordUseCase } from "../../../application/use-cases/usecase interfaces/auth/IForgotPasswordUseCase.js";
import type { IResetPasswordUseCase } from "../../../application/use-cases/usecase interfaces/auth/IResetPasswordUseCase.js";
import type { VerifyResetOtpDTO } from "../../../application/dto/auth/VerifyResetOtpDTO.js";
import type { IVerifyResetOtpUseCase } from "../../../application/use-cases/usecase interfaces/auth/IVerifyResetOtpUseCase.js";
import type { IResendOtpUseCase } from "../../../application/use-cases/usecase interfaces/auth/IResendOtpUseCase.js";
import type { IGetCurrentUserUseCase } from "../../../application/use-cases/usecase interfaces/auth/IGetCurrentUserUseCase.js";

export class AuthController {
  constructor(
    private _registerUserUseCase: IRegisterUserUseCase,
    private _verifyOtpUseCase: IVerifyOtpUseCase,
    private _loginUseCase: ILoginUseCase,
    private _refreshTokenUseCase: IRefreshTokenUseCase,
    private _googleAuthUseCase: IGoogleAuthUseCase,
    private _forgotPasswordUseCase: IForgotPasswordUseCase,
    private _resetPasswordUseCase: IResetPasswordUseCase,
    private _verifyResetOtpUseCase: IVerifyResetOtpUseCase,
    private _resendOtpUseCase: IResendOtpUseCase,
    private _googleAuthService: IGoogleAuthService,
    private _getCurrentUserUseCase: IGetCurrentUserUseCase,
  ) { }

  public register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto: RegisterUserDTO = req.body;
    const createdUser = await this._registerUserUseCase.execute(dto);

    res.status(HttpStatusCode.CREATED).json({
      success: true,
      message: AppMessages.SUCCESS.USER_REGISTERED,
      data: {
        id: createdUser.id,
        fullName: createdUser.fullName,
        email: createdUser.email,
        roles: createdUser.roles,
      },
    });
  });

  public googleAuth = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {

      const { credential } = req.body;

      console.log("Google credential exists:", !!credential);

      const googleUser = await this._googleAuthService.verifyCredential(credential);

      const result = await this._googleAuthUseCase.execute(googleUser);

      setAuthCookies(res, result.accessToken, result.refreshToken);

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
    await this._verifyOtpUseCase.execute(dto);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: AppMessages.SUCCESS.OTP_VERIFIED,
    });
  });

  public login = asyncHandler(async (req: Request, res: Response): Promise<void> => {

    const dto: LoginDTO = req.body;

    const result = await this._loginUseCase.execute(dto);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(HttpStatusCode.OK).json({

      success: true,

      message: AppMessages.SUCCESS.LOGIN_SUCCESSFUL,

      data: {

        user: result.user,

      },

    });

  });

  public forgotPassword = asyncHandler(

    async (req: Request, res: Response): Promise<void> => {

      const dto: ForgotPasswordDTO = req.body;

      await this._forgotPasswordUseCase.execute(dto);

      res.status(HttpStatusCode.OK).json({

        success: true,

        message: AppMessages.SUCCESS.OTP_SENT_SUCCESS

      })

    }
    
  );

  public verifyResetOtp = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const dto: VerifyResetOtpDTO = req.body;

      const resetToken = await this._verifyResetOtpUseCase.execute(dto);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: AppMessages.SUCCESS.RESET_OTP_VERIFIED,
        data: {
          resetToken,
        }
      })
    }
  )

  public resetPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const dto: ResetPasswordDTO = req.body;

      await this._resetPasswordUseCase.execute(dto);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: AppMessages.SUCCESS.PASSWORD_RESET_SUCCESS
      })
    }
  )

  public refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.REFRESH_TOKEN_MISSING);
    }

    const result = await this._refreshTokenUseCase.execute(refreshToken);

    setAccessTokenCookie(res, result.accessToken);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: AppMessages.SUCCESS.TOKEN_REFRESHED,
      data: {
        user: result.user,
      },
    });
  });

  public logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {

    clearAuthCookies(res);

    res.status(HttpStatusCode.OK).json({
      success: true,
      message: AppMessages.SUCCESS.LOGGED_OUT,
    });
  });

  public resendOtp = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {

      const dto: ResendOtpDTO = req.body;

      await this._resendOtpUseCase.execute(dto);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: AppMessages.SUCCESS.OTP_RESENT_SUCCESS
      })
    }
  )

  public getCurrentUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {

      const user = await this._getCurrentUserUseCase.execute(req.user!.userId);

      res.status(HttpStatusCode.OK).json({
        success: true,
        message: AppMessages.SUCCESS.PROTECTED_ROUTE_ACCESSED,
        data: {
          user,
        },
      });
    }
  );
}
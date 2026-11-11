import type { Request, Response } from "express";
import asyncHandler from "../../../shared/utils/asyncHandler.js";

import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import { AppMessages } from "../../../shared/constants/messages.js";
import { sendSuccess } from "../../../shared/response/index.js";

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
import type { IGetCurrentSessionUseCase } from "../../../application/use-cases/usecase interfaces/auth/IGetCurrentSessionUseCase.js";
import type { IUpdateUserProfileUseCase } from "../../../application/use-cases/usecase interfaces/auth/IUpdateUserProfileUseCase.js";
import type { ISwitchModeUseCase } from "../../../application/use-cases/usecase interfaces/auth/ISwitchModeUseCase.js";
import type { AuthRequest } from "../../../shared/types/AuthRequest.js";

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
    private _getSessionUseCase: IGetCurrentSessionUseCase,
    private _updateUserProfileUseCase?: IUpdateUserProfileUseCase,
    private _switchModeUseCase?: ISwitchModeUseCase,
  ) { }

  public register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto: RegisterUserDTO = req.body;
    const createdUser = await this._registerUserUseCase.execute(dto);

    sendSuccess(
      res,
      {
        id: createdUser.id,
        fullName: createdUser.fullName,
        email: createdUser.email,
        roles: createdUser.roles,
        isVerified: createdUser.isVerified,
      },
      AppMessages.SUCCESS.USER_REGISTERED,
      HttpStatusCode.CREATED
    );
  });

  public googleAuth = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {

      const { credential } = req.body;

      console.log("Google credential exists:", !!credential);

      const googleUser = await this._googleAuthService.verifyCredential(credential);

      const result = await this._googleAuthUseCase.execute(googleUser);

      setAuthCookies(res, result.accessToken, result.refreshToken);

      // Do NOT expose tokens in the JSON response — they live only in HTTP-only cookies
      sendSuccess(
        res,
        {
          user: result.user,
        },
        AppMessages.SUCCESS.LOGIN_SUCCESSFUL,
        HttpStatusCode.OK
      );
    }
  );

  public verifyOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const dto: VerifyOtpDTO = req.body;
    await this._verifyOtpUseCase.execute(dto);

    sendSuccess(
      res,
      undefined,
      AppMessages.SUCCESS.OTP_VERIFIED,
      HttpStatusCode.OK
    );
  });

  public login = asyncHandler(async (req: Request, res: Response): Promise<void> => {

    const dto: LoginDTO = req.body;

    const result = await this._loginUseCase.execute(dto);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    sendSuccess(
      res,
      {
        user: result.user,
      },
      AppMessages.SUCCESS.LOGIN_SUCCESSFUL,
      HttpStatusCode.OK
    );

  });

  public forgotPassword = asyncHandler(

    async (req: Request, res: Response): Promise<void> => {

      const dto: ForgotPasswordDTO = req.body;

      await this._forgotPasswordUseCase.execute(dto);

      sendSuccess(
        res,
        undefined,
        AppMessages.SUCCESS.OTP_SENT_SUCCESS,
        HttpStatusCode.OK
      );

    }
    
  );

  public verifyResetOtp = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const dto: VerifyResetOtpDTO = req.body;

      const resetToken = await this._verifyResetOtpUseCase.execute(dto);

      sendSuccess(
        res,
        {
          resetToken,
        },
        AppMessages.SUCCESS.RESET_OTP_VERIFIED,
        HttpStatusCode.OK
      );
    }
  )

  public resetPassword = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const dto: ResetPasswordDTO = req.body;

      await this._resetPasswordUseCase.execute(dto);

      sendSuccess(
        res,
        undefined,
        AppMessages.SUCCESS.PASSWORD_RESET_SUCCESS,
        HttpStatusCode.OK
      );
    }
  )

  public refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken as string | undefined;

    if (!refreshToken) {
      throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.REFRESH_TOKEN_MISSING);
    }

    const result = await this._refreshTokenUseCase.execute(refreshToken);

    setAccessTokenCookie(res, result.accessToken);

    sendSuccess(
      res,
      {
        user: result.user,
      },
      AppMessages.SUCCESS.TOKEN_REFRESHED,
      HttpStatusCode.OK
    );
  });

  public logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {

    clearAuthCookies(res);

    sendSuccess(
      res,
      undefined,
      AppMessages.SUCCESS.LOGGED_OUT,
      HttpStatusCode.OK
    );
  });

  public resendOtp = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {

      const dto: ResendOtpDTO = req.body;

      await this._resendOtpUseCase.execute(dto);

      sendSuccess(
        res,
        undefined,
        AppMessages.SUCCESS.OTP_RESENT_SUCCESS,
        HttpStatusCode.OK
      );
    }
  )

  /**
   * Session-aware /auth/me endpoint.
   * Does NOT require the authenticate middleware — it handles session restoration
   * internally, using the access token if valid, or the refresh token if the access
   * token has expired. Sets a new access cookie when refreshing.
   */
  public getCurrentUser = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {

      const accessToken = req.cookies.accessToken as string | undefined;
      const refreshToken = req.cookies.refreshToken as string | undefined;

      const result = await this._getSessionUseCase.execute(accessToken, refreshToken);

      // If the session was restored via refresh token, issue a new access cookie
      if (result.newAccessToken) {
        setAccessTokenCookie(res, result.newAccessToken);
      }

      sendSuccess(
        res,
        {
          user: result.user,
        },
        AppMessages.SUCCESS.PROTECTED_ROUTE_ACCESSED,
        HttpStatusCode.OK
      );
    }
  );

  public updateProfile = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
      }

      if (!this._updateUserProfileUseCase) {
        throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "Update profile usecase not initialized");
      }

      const { fullName } = req.body;
      const updatedUser = await this._updateUserProfileUseCase.execute(userId, { fullName });

      sendSuccess(
        res,
        {
          user: updatedUser,
        },
        "Profile updated successfully",
        HttpStatusCode.OK
      );
    }
  );

  public switchMode = asyncHandler(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const userId = req.user?.userId;
      if (!userId) {
        throw new ApiError(HttpStatusCode.UNAUTHORIZED, AppMessages.ERROR.UNAUTHORIZED);
      }

      if (!this._switchModeUseCase) {
        throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "Switch mode usecase not initialized");
      }

      const { mode } = req.body as { mode: "USER" | "SERVICE_PROVIDER" };
      const result = await this._switchModeUseCase.execute(userId, mode);

      setAccessTokenCookie(res, result.accessToken);

      sendSuccess(
        res,
        {
          activeMode: result.activeMode,
          isActivated: result.isActivated,
          user: result.user,
        },
        `Switched to ${result.activeMode === "SERVICE_PROVIDER" ? "Service Provider" : "User"} mode`,
        HttpStatusCode.OK
      );
    }
  );
}
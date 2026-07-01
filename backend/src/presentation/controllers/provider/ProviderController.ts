import type { Response } from "express";

import type { AuthRequest } from "../../../shared/types/AuthRequest.js";

import asyncHandler from "../../../shared/utils/asyncHandler.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import type { IStartProviderOnboardingUseCase } from "../../../application/use-cases/usecase interfaces/IStartProviderOnboardingUseCase.js";

import type { ICompleteProviderStep2UseCase } from "../../../application/use-cases/usecase interfaces/ICompleteProviderStep2UseCase.js";

import type { ICompleteProviderStep3UseCase } from "../../../application/use-cases/usecase interfaces/ICompleteProviderStep3UseCase.js";

import type { IGetProviderProfileUseCase } from "../../../application/use-cases/usecase interfaces/IGetProviderProfileUseCase.js";

import type { IJwtService } from "../../../domain/interface/IJwtService.js";

import { UserMapper } from "../../../application/mappers/UserMapper.js";

export class ProviderController {

    constructor(

        private startProviderOnboardingUseCase: IStartProviderOnboardingUseCase,

        private completeProviderStep2UseCase: ICompleteProviderStep2UseCase,

        private completeProviderStep3UseCase: ICompleteProviderStep3UseCase,

        private getProviderProfileUseCase: IGetProviderProfileUseCase,

        private jwtService: IJwtService,

    ) { }

    completeStep1 = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {

        const { providerType } = req.body;

        const userId = req.user!.userId;

        const user =
            await this.startProviderOnboardingUseCase.execute(
                userId,
                providerType
            );

        const accessToken =
            this.jwtService.generateAccessToken(
                user.id!,
                user.roles
            );

        res.status(HttpStatusCode.CREATED).json({

            success: true,

            message: AppMessages.SUCCESS.SERVICE_PROVIDER_PROFILE_CREATED,

             data: {

                accessToken,

                user: UserMapper.toAuthResponse(user),
            },
        });

    });

    completeStep2 = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {

        await this.completeProviderStep2UseCase.execute({ userId: req.user!.userId, ...req.body });

        res.status(HttpStatusCode.OK).json({

            success: true,

            message:
                AppMessages.SUCCESS
                    .PROVIDER_STEP2_COMPLETED,
        });
    });

    completeStep3 = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {

        await this.completeProviderStep3UseCase.execute(req.user!.userId);

        res.status(HttpStatusCode.OK).json({

            success: true,

            message:
                AppMessages.SUCCESS.PROVIDER_ONBOARDING_COMPLETED
        });
    });

    getProfile = asyncHandler(

        async (req: AuthRequest, res: Response): Promise<void> => {

            const provider = await this.getProviderProfileUseCase.execute(req.user!.userId);

            res.status(HttpStatusCode.OK).json({ success: true, provider });
        }
    );

}
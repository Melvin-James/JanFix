import type { Response } from "express";

import type { AuthRequest } from "../../../shared/types/AuthRequest.js";

import asyncHandler from "../../../shared/utils/asyncHandler.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import type { ICompleteProviderStep1UseCase } from "../../../application/use-cases/usecase interfaces/ICompleteProviderStep1UseCase.js";

import type { ICompleteProviderStep2UseCase } from "../../../application/use-cases/usecase interfaces/ICompleteProviderStep2UseCase.js";

import type { ICompleteProviderStep3UseCase } from "../../../application/use-cases/usecase interfaces/ICompleteProviderStep3UseCase.js";

import type { IGetProviderProfileUseCase } from "../../../application/use-cases/usecase interfaces/IGetProviderProfileUseCase.js";

export class ProviderController {

    constructor(

        private completeProviderStep1UseCase: ICompleteProviderStep1UseCase,

        private completeProviderStep2UseCase: ICompleteProviderStep2UseCase,

        private completeProviderStep3UseCase: ICompleteProviderStep3UseCase,

        private getProviderProfileUseCase: IGetProviderProfileUseCase

    ) { }

    completeStep1 = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {

        const { providerType } = req.body;

        const userId = req.user!.userId;

        await this.completeProviderStep1UseCase.execute(userId, providerType);


        res.status(HttpStatusCode.CREATED).json({

            success: true,

            message: AppMessages.SUCCESS.SERVICE_PROVIDER_PROFILE_CREATED
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
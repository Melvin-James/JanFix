import type { Response } from "express";

import type { AuthRequest } from "../../../shared/types/AuthRequest.js";

import asyncHandler from "../../../shared/utils/asyncHandler.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import type { IGetProviderApplicationsUseCase } from "../../../application/use-cases/usecase interfaces/IGetProviderApplicationsUseCase.js";

import type { IGetProviderApplicationDetailsUseCase } from "../../../application/use-cases/usecase interfaces/IGetProviderApplicationDetailsUseCase.js";

import type { IApproveProviderApplicationUseCase } from "../../../application/use-cases/usecase interfaces/IApproveProviderApplicationUseCase.js";

import type { IRejectProviderApplicationUseCase } from "../../../application/use-cases/usecase interfaces/IRejectProviderApplicationUseCase.js";

export class AdminController {

    constructor(

        private getProviderApplicationUseCase: IGetProviderApplicationsUseCase,
        
        private getProviderApplicationDetailUseCase: IGetProviderApplicationDetailsUseCase,
        
        private readonly approveProviderApplicationUseCase: IApproveProviderApplicationUseCase,
        
        private readonly rejectProviderApplicationUseCase: IRejectProviderApplicationUseCase

    ) {}

    getProviderApplications = asyncHandler(
        
        async (
            _req: AuthRequest,
            res: Response
        ): Promise<void> => {


            const applications = await this.getProviderApplicationUseCase.execute();

            res.status(
                HttpStatusCode.OK
            )
            .json({
                success:true,
                applications
            });

        }
    );

    getProviderApplicationDetails = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {

            const userId = req.params.userId;

            if(typeof userId !== "string") {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid user ID."
                });
                return;
            }

            const application = await this.getProviderApplicationDetailUseCase.execute(userId);

            res.status(HttpStatusCode.OK).json({
                success:true,
                application,
            });
        }
    );

    approveProviderApplication = asyncHandler(
        async (req: AuthRequest, res: Response):Promise<void> => {

            const userId = req.params.userId;

            if(typeof userId !== 'string') {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid user ID"
                });
                return;
            }

            await this.approveProviderApplicationUseCase.execute(userId);

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Provider application approved succesfuly"
            })
        }
    )

    rejectProviderApplication = asyncHandler(
        async (req: AuthRequest, res: Response): Promise<void> => {
            

            const userId = req.params.userId;

            if(typeof userId !== 'string') {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid user ID."
                });
                return;
            }

            const {rejectionReason} = req.body;

            await this.rejectProviderApplicationUseCase.execute(
                userId,
                rejectionReason
            );

            res.status(HttpStatusCode.OK).json({
                success: true,
                message: "Provider application rejected successfully."
            });
        }
    )

}
import type { Response } from "express";

import type { AuthRequest } from "../../../shared/types/AuthRequest.js";

import asyncHandler from "../../../shared/utils/asyncHandler.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import type { ISubmitProviderApplicationUseCase } from "../../../application/use-cases/usecase interfaces/provider/ISubmitProviderApplicationUseCase.js";

import type { IResubmitProviderApplicationUseCase } from "../../../application/use-cases/usecase interfaces/provider/IResubmitProviderApplicationUseCase.js";

import type { IGetProviderProfileUseCase } from "../../../application/use-cases/usecase interfaces/provider/IGetProviderProfileUseCase.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import { UserMapper } from "../../../application/mappers/UserMapper.js";

export class ProviderController {


    constructor(

        private _submitProviderApplicationUseCase:
            ISubmitProviderApplicationUseCase,

        private _resubmitProviderApplicationUseCase:
            IResubmitProviderApplicationUseCase,

        private _getProviderProfileUseCase:
            IGetProviderProfileUseCase

    ) { }





    submit = asyncHandler(

        async (

            req: AuthRequest,

            res: Response

        ): Promise<void> => {



           const user =  await this
                ._submitProviderApplicationUseCase
                .execute(

                    req.user!.userId,

                    req.body

                );



            res.status(
                HttpStatusCode.CREATED
            )
            .json({

                success: true,


                message:
                    AppMessages.SUCCESS
                        .SERVICE_PROVIDER_PROFILE_CREATED,

                data: {
                    user: UserMapper.toAuthResponse(user)
                }

            });

        }

    );



    resubmit = asyncHandler(

        async (

            req: AuthRequest,

            res: Response

        ): Promise<void> => {


           const user = await this
                ._resubmitProviderApplicationUseCase
                .execute(

                    req.user!.userId,

                    req.body

                );



            res.status(
                HttpStatusCode.OK
            )
            .json({

                success: true,


                message:
                    AppMessages.SUCCESS
                        .APPLICATION_RESUBMITTED,

                data: {
                    user: UserMapper.toAuthResponse(user)
                }

            });

        }

    );


    getProfile = asyncHandler(

        async (

            req: AuthRequest,

            res: Response

        ): Promise<void> => {



            const provider =

                await this
                    ._getProviderProfileUseCase
                    .execute(

                        req.user!.userId

                    );




            res.status(
                HttpStatusCode.OK
            )
            .json({

                success: true,

                provider

            });

        }

    );

}
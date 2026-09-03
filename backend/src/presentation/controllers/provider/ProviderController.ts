import type { Response } from "express";

import type { AuthRequest } from "../../../shared/types/AuthRequest.js";

import asyncHandler from "../../../shared/utils/asyncHandler.js";

import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

import type { ISubmitProviderApplicationUseCase } from "../../../application/use-cases/usecase interfaces/ISubmitProviderApplicationUseCase.js";

import type { IGetProviderProfileUseCase } from "../../../application/use-cases/usecase interfaces/IGetProviderProfileUseCase.js";

import { AppMessages } from "../../../shared/constants/messages.js";

import { UserMapper } from "../../../application/mappers/UserMapper.js";

export class ProviderController {


    constructor(

        private submitProviderApplicationUseCase:
            ISubmitProviderApplicationUseCase,


        private getProviderProfileUseCase:
            IGetProviderProfileUseCase

    ) { }





    submit = asyncHandler(

        async (

            req: AuthRequest,

            res: Response

        ): Promise<void> => {



           const user =  await this
                .submitProviderApplicationUseCase
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







    getProfile = asyncHandler(

        async (

            req: AuthRequest,

            res: Response

        ): Promise<void> => {



            const provider =

                await this
                    .getProviderProfileUseCase
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
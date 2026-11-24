import type { User } from "../../../../domain/entities/User.ts";

import type { SubmitProviderApplicationDTO } from "../../../dto/provider/SubmitProviderApplicationDTO.ts";


export interface ISubmitProviderApplicationUseCase {


    execute(

        userId:string,

        dto:SubmitProviderApplicationDTO


    ):Promise<User>;
}
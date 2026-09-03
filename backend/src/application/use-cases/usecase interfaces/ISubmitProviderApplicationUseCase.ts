import type { User } from "../../../domain/entities/User.js";

import type { SubmitProviderApplicationDTO } from "../../dto/provider/SubmitProviderApplicationDTO.js";


export interface ISubmitProviderApplicationUseCase {


    execute(

        userId:string,

        dto:SubmitProviderApplicationDTO


    ):Promise<User>;
}
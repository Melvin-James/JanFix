import type { SubmitProviderApplicationDTO } from "../../dto/provider/SubmitProviderApplicationDTO.js";


export interface ISubmitProviderApplicationUseCase {


    execute(

        userId:string,

        dto:SubmitProviderApplicationDTO


    ):Promise<void>;
}
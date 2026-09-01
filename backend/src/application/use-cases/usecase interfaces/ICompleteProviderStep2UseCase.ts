import type { SubmitProviderApplicationDTO } from "../../dto/provider/SubmitProviderApplicationDTO.js";

export interface ICompleteProviderStep2UseCase {

  execute(
    dto: SubmitProviderApplicationDTO
  ): Promise<void>;
}
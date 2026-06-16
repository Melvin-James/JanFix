import type { CompleteProviderStep2RequestDto } from "../../dto/provider/CompleteProviderStep2RequestDto.js";

export interface ICompleteProviderStep2UseCase {

  execute(
    dto: CompleteProviderStep2RequestDto
  ): Promise<void>;
}
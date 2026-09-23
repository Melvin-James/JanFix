import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import { AppMessages } from "../../../shared/constants/messages.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";
import ApiError from "../../../shared/utils/apiError.js";
import type { ServiceProviderDetailsResponseDTO } from "../../dto/admin/ServiceProviderDetailsResponseDTO.js";
import { ServiceProviderDetailsMapper } from "../../mappers/ServiceProviderDetailsMapper.js";
import type { IGetServiceProviderDetailsUseCase } from "../usecase interfaces/IGetServiceProviderDetailsUseCase.js";

export class GetServiceProviderDetailsUseCase
    implements IGetServiceProviderDetailsUseCase
{
    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async execute(
        userId: string
    ): Promise<ServiceProviderDetailsResponseDTO> {

        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND, 
                AppMessages.ERROR.USER_NOT_FOUND
            );
        }

        if (!user.providerProfile) {
            throw new ApiError(
                HttpStatusCode.NOT_FOUND, 
                AppMessages.ERROR.PROVIDER_NOT_FOUND
            );
        }

        return ServiceProviderDetailsMapper.toResponse(user);
    }
}
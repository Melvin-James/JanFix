import type { IServiceProviderRepository } from "../../domain/interface/IServiceProviderRepository.js";

import type { ServiceProvider } from "../../domain/entities/ServiceProvider.js";

import ServiceProviderModel from "../models/ServiceProviderModel.js";

import { BaseRepository } from "./base/BaseRepository.js";

import { ServiceProviderMapper } from "../mappers/ServiceProviderMapper.js";

import ApiError from "../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.js";

export class ServiceProviderRepository extends BaseRepository<ServiceProvider> implements IServiceProviderRepository {

    constructor() {

        super(

            ServiceProviderModel,

            ServiceProviderMapper.toEntity
        );
    }

    async findByUserId(userId: string): Promise<ServiceProvider | null> {

        const provider = await ServiceProviderModel.findOne({ userId });

        if (!provider) {

            return null;
        }

        return ServiceProviderMapper.toEntity(provider);
    }

    async updateProvider(provider: ServiceProvider): Promise<ServiceProvider> {

        const updatedProvider = await super.update(provider.id as string, provider);

        if (!updatedProvider) {

            throw new ApiError(HttpStatusCode.NOT_FOUND, "Service provider not found");
        }

        return updatedProvider;
    }
}
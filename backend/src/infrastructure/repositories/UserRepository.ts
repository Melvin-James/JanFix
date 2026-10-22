
import type { QueryFilter } from "mongoose";

import type { IUserRepository } from "../../domain/interface/IUserRepository.js";

import type { User } from "../../domain/entities/User.js";

import UserModel, { type UserDocument } from "../models/UserModel.js";

import { BaseRepository } from "./base/BaseRepository.js";

import { UserMapper } from "../mappers/UserMapper.js";

import ApiError from "../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../shared/constants/messages.js";

import { ApplicationStatus } from "../../domain/enums/ApplicationStatus.js";

import { Role } from "../../domain/enums/Role.js";

import { AuthProvider } from "../../domain/enums/AuthProvider.js";

type UserFilter = QueryFilter<UserDocument>;

const escapedRegex = (value: string): string => 
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class UserRepository extends BaseRepository<User> implements IUserRepository {

  constructor() {

    super(

      UserModel,

      UserMapper.toEntity

    );

  }

  async findByEmail(email: string): Promise<User | null> {

    const user = await UserModel.findOne({ email }).populate("providerProfile.workPreferences.categoriesWillingToWork");

    if (!user) {

      return null;

    }

    return UserMapper.toEntity(user);

  }

  override async findById(id: string): Promise<User | null> {
    const document = await UserModel.findById(id).populate("providerProfile.workPreferences.categoriesWillingToWork");
    if (!document) return null;
    return UserMapper.toEntity(document);
  }

  async updateUser(user: User): Promise<User> {

    const updatedUser = await super.update(user.id as string, user);

    if (!updatedUser) {

      throw new ApiError(HttpStatusCode.NOT_FOUND, AppMessages.ERROR.USER_NOT_FOUND);

    }

    return updatedUser;
  }

  async findUsersWithProviderApplications(): Promise<User[]> {

    const users = await UserModel.find({
      providerProfile: { $exists: true }
    }).populate("providerProfile.workPreferences.categoriesWillingToWork");

    return users.map(
      UserMapper.toEntity
    );
  }


  async findApprovedServiceProviders(): Promise<User[]> {

    const users = await UserModel.find({

      providerProfile: {

        $exists: true

      },

      "providerProfile.status.applicationStatus": ApplicationStatus.APPROVED

    }).populate("providerProfile.workPreferences.categoriesWillingToWork");

    return users.map(UserMapper.toEntity);

  }

  async findUsersForManagement(): Promise<User[]> {

    const users = await UserModel.find({

      roles: { $in: [Role.USER] },

    });

    return users.map(UserMapper.toEntity);
  }

  async findPaginatedProviderApplications(
    page: number,
    pageSize: number,
    filters?: { search?: string; status?: string; providerType?: string }
  ) {

    const safePage = Number.isInteger(page) && page > 0 ? page : 1;

    const safePageSize = Number.isInteger(pageSize) && pageSize > 0
      ? Math.min(pageSize, 100)
      : 10;

    const query: UserFilter = { providerProfile: { $exists: true } };

    if (filters?.status && filters.status !== "ALL") {
      query["providerProfile.status.applicationStatus"] = filters.status;
    }

    if (filters?.providerType && filters.providerType !== "ALL") {
      query["providerProfile.identity.providerType"] = filters.providerType;
    }

    if (filters?.search && filters.search.trim() !== "") {
      
      const searchRegex = new RegExp(escapedRegex(filters.search.trim()), "i");

      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { "providerProfile.identity.providerName": searchRegex },
        { "providerProfile.identity.responsiblePersonName": searchRegex },
      ];
    }

    const totalItems = await UserModel.countDocuments(query);

    const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));

    const skip = (safePage - 1) * safePageSize;

    const docs = await UserModel.find(query)
      .populate("providerProfile.workPreferences.categoriesWillingToWork")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(safePageSize);

    return {
      items: docs.map(UserMapper.toEntity),
      pagination: {
        page: safePage,
        pageSize: safePageSize,
        totalItems,
        totalPages,
      },
    };
  }

  
  async findPaginatedServiceProviders(
    page: number,
    pageSize: number,
    filters?: { search?: string; providerType?: string; status?: string }
  ) {

    const safePage = Number.isInteger(page) && page > 0 ? page : 1;

    const safePageSize = Number.isInteger(pageSize) && pageSize > 0
      ? Math.min(pageSize, 100)
      : 10;

    const query: UserFilter = {
      providerProfile: { $exists: true },
      "providerProfile.status.applicationStatus": ApplicationStatus.APPROVED,
    };

    if (filters?.status && filters.status !== "ALL") {
      query["providerProfile.status.providerStatus"] = filters.status;
    }

    if (filters?.providerType && filters.providerType !== "ALL") {
      query["providerProfile.identity.providerType"] = filters.providerType;
    }

    if (filters?.search && filters.search.trim() !== "") {
      const searchRegex = new RegExp(escapedRegex(filters.search.trim()), "i");
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { "providerProfile.identity.providerName": searchRegex },
        { "providerProfile.identity.responsiblePersonName": searchRegex },
      ];
    }

    const totalItems = await UserModel.countDocuments(query);

    const totalPages = Math.max(1, Math.ceil(totalItems / safePageSize));

    const skip = (safePage - 1) * safePageSize;

    const docs = await UserModel.find(query)
      .populate("providerProfile.workPreferences.categoriesWillingToWork")
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(safePageSize);

    return {
      items: docs.map(UserMapper.toEntity),
      pagination: {
        page: safePage,
        pageSize: safePageSize,
        totalItems,
        totalPages,
      },
    };
  }

  async findPaginatedUsersForManagement(
    page: number,
    pageSize: number,
    filters?: { search?: string; role?: string; verification?: string; authProvider?: string }
  ) {
    const query: UserFilter = {
      roles: { $in: [Role.USER] },
    };

    if (filters?.role && filters.role !== "ALL") {
      query.roles = { $in: [filters.role as Role] };
    }

    if (filters?.verification && filters.verification !== "ALL") {
      query.isVerified = filters.verification === "VERIFIED";
    }

    if (filters?.authProvider && filters.authProvider !== "ALL") {
      query.authProvider = filters.authProvider as AuthProvider;
    }

    if (filters?.search && filters.search.trim() !== "") {

      const searchRegex = new RegExp(filters.search.trim(), "i");

      query.$or = [{ fullName: searchRegex }, { email: searchRegex }];

    }

    const totalItems = await UserModel.countDocuments(query);

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const skip = (page - 1) * pageSize;

    const docs = await UserModel.find(query).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(pageSize);

    return {
      items: docs.map(UserMapper.toEntity),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }
}

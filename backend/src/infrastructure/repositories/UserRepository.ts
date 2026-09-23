import type { IUserRepository } from "../../domain/interface/IUserRepository.js";

import type { User } from "../../domain/entities/User.js";

import UserModel from "../models/UserModel.js";

import { BaseRepository } from "./base/BaseRepository.js";

import { UserMapper } from "../mappers/UserMapper.js";

import ApiError from "../../shared/utils/apiError.js";

import { HttpStatusCode } from "../../shared/enums/HttpStatusCode.js";

import { AppMessages } from "../../shared/constants/messages.js";

import { ApplicationStatus } from "../../domain/enums/ApplicationStatus.js";

import { Role } from "../../domain/enums/Role.js";

export class UserRepository extends BaseRepository<User> implements IUserRepository {

  constructor() {

    super(

      UserModel,

      UserMapper.toEntity

    );

  }

  async findByEmail(email: string): Promise<User | null> {

    const user = await UserModel.findOne({ email });

    if (!user) {

      return null;

    }

    return UserMapper.toEntity(user);

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
      providerProfile: {$exists: true}
    });

    return users.map(
      UserMapper.toEntity
    );
  }


  async findApprovedServiceProviders(): Promise<User[]> {

    const users = await UserModel.find({

      providerProfile:{

        $exists: true

      },

      "providerProfile.status.applicationStatus": ApplicationStatus.APPROVED

    });

    return users.map(UserMapper.toEntity);

  }

  async findUsersForManagement(): Promise<User[]> {
    
    const users = await UserModel.find({

      roles: {$in: [Role.USER]},
      
    });

    return users.map(UserMapper.toEntity);
  }
}
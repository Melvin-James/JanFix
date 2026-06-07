import type { IUserRepository } from "../../domain/interface/IUserRepository.js";
import type { User } from "../../domain/entities/User.js";
import UserModel from "../models/UserModel.js";
import ApiError from "../../shared/utils/apiError.js";

export class UserRepository implements IUserRepository {

  private mapToEntity(document: any): User {

    return {

      id: document._id.toString(),

      name: document.name,

      email: document.email,

      password: document.password,

      role: document.role,

      isVerified: document.isVerified,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return null;
    }
    return this.mapToEntity(user);
  }

  async create(user: User): Promise<User> {
    const createdUser = await UserModel.create(user);
    return this.mapToEntity(createdUser);
  }

  async update(user: User): Promise<User> {

    const updatedUser =
      await UserModel.findByIdAndUpdate(
        user.id,
        user,
        { new: true }
      );

    if (!updatedUser) {
      throw new ApiError(404, 'User Not Found')
    }
    return this.mapToEntity(updatedUser);
  }

  async findById(id: string): Promise<User | null> {

    const user = await UserModel.findById(id);

    if (!user) {
      return null;
    }

    return this.mapToEntity(user);
  }
}
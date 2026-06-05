import type { IUserRepository } from "../../domain/interface/IUserRepository.js";
import type { User } from "../../domain/entities/User.js";
import UserModel from "../models/UserModel.js";

export class UserRepository implements IUserRepository {

  async findByEmail(email: string): Promise<User | null> {
    return await UserModel.findOne({ email });
  }

  async create(user: User): Promise<User> {
    return await UserModel.create(user);
  }

  async update(user: User): Promise<User> {

    const updatedUser =
      await UserModel.findByIdAndUpdate(
        user.id,
        user,
        { new: true }
      );

    return updatedUser as User;
  }
}
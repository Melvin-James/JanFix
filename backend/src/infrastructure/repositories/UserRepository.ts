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
}
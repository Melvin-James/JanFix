import type { User } from "../entities/User.js";

export interface IUserRepository {
    
    findByEmail(email: string): Promise<User | null>;

    create(user: User): Promise<User>;

    updateUser(user: User): Promise<User>;

    findById(id: string): Promise<User | null>;

}
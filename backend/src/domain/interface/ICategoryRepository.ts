import type { Category } from "../entities/Category.js";

export interface ICategoryRepository {

    findById(id: string): Promise<Category | null>;

    findByName(name: string): Promise<Category |null>;

    findAll(): Promise<Category[]>;

    create(category: Category): Promise<Category>;

    update(id: string, data: Partial<Category>): Promise<Category | null>;

}
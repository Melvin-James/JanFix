import type { ServiceProvider } from "../entities/ServiceProvider.js";

export interface IServiceProviderRepository {

  create(provider: Partial<ServiceProvider>): Promise<ServiceProvider>;

  findByUserId(userId: string): Promise<ServiceProvider | null>;

  findById(id: string): Promise<ServiceProvider | null>;

  updateProvider(provider: ServiceProvider): Promise<ServiceProvider>;
  
}
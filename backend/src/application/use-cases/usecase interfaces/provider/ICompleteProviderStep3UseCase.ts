export interface ICompleteProviderStep3UseCase {

  execute(
    userId: string
  ): Promise<void>;
}
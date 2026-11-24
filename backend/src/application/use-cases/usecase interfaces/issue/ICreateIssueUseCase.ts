import type { CreateIssueDTO } from "../../../dto/issue/CreateIssueDTO.ts";
import type { IssueResponseDTO } from "../../../dto/issue/IssueResponseDTO.ts";

export interface ICreateIssueUseCase {
    execute(dto: CreateIssueDTO): Promise<IssueResponseDTO>;
}

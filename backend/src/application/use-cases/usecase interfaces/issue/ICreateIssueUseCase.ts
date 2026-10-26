import type { CreateIssueDTO } from "../../../dto/issue/CreateIssueDTO.js";
import type { IssueResponseDTO } from "../../../dto/issue/IssueResponseDTO.js";

export interface ICreateIssueUseCase {
    execute(dto: CreateIssueDTO): Promise<IssueResponseDTO>;
}

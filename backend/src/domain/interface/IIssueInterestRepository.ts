import type { IssueInterest } from "../entities/IssueInterest.js";

export interface IIssueInterestRepository {
    create(issueId: string, providerId: string): Promise<IssueInterest>;
    exists(issueId: string, providerId: string): Promise<boolean>;
    findInterestsByProvider(providerId: string): Promise<string[]>;
    countByIssue(issueId: string): Promise<number>;
}

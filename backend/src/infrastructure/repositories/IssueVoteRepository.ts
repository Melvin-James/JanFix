import { Types } from "mongoose";
import type { IIssueVoteRepository } from "../../domain/interface/IIssueVoteRepository.js";
import type { IssueVote } from "../../domain/entities/IssueVote.js";
import { IssueVoteModel } from "../models/IssueVoteModel.js";
import { IssueVoteMapper } from "../mappers/IssueVoteMapper.js";
import { BaseRepository } from "./base/BaseRepository.js";

export class IssueVoteRepository extends BaseRepository<IssueVote> implements IIssueVoteRepository {
    constructor() {
        super(IssueVoteModel, IssueVoteMapper.toEntity);
    }

    async addVote(issueId: string, userId: string): Promise<boolean> {
        try {
            await IssueVoteModel.create({
                issueId: new Types.ObjectId(issueId),
                userId: new Types.ObjectId(userId),
            });
            return true;
        } catch (error: unknown) {
            const mongoError = error as { code?: number; name?: string };
            // Code 11000 indicates a duplicate key violation on { issueId: 1, userId: 1 }
            if (mongoError.code === 11000) {
                return false;
            }
            throw error;
        }
    }

    async removeVote(issueId: string, userId: string): Promise<boolean> {
        const result = await IssueVoteModel.deleteOne({
            issueId: new Types.ObjectId(issueId),
            userId: new Types.ObjectId(userId),
        });
        return (result.deletedCount ?? 0) > 0;
    }

    async hasUserVoted(issueId: string, userId: string): Promise<boolean> {
        const exists = await IssueVoteModel.exists({
            issueId: new Types.ObjectId(issueId),
            userId: new Types.ObjectId(userId),
        });
        return Boolean(exists);
    }

    async countByIssueId(issueId: string): Promise<number> {
        return await IssueVoteModel.countDocuments({
            issueId: new Types.ObjectId(issueId),
        });
    }
}
export default IssueVoteRepository;

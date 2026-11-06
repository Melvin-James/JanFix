import type { Document } from "mongoose";
import type { Issue } from "../../domain/entities/Issue.js";
import type { IssueDocument } from "../models/IssueModel.js";
import { IssueStatus } from "../../domain/enums/IssueStatus.js";
import { ProposalWindowStatus } from "../../domain/enums/ProposalWindowStatus.js";

export class IssueMapper {
    static toEntity(doc: Document): Issue {
        const document = doc as IssueDocument;
        const rawCategory = (document as unknown as { category?: { _id?: unknown; name?: string } | { toString(): string } }).category;
        const categoryId = rawCategory && typeof rawCategory === "object" && "_id" in rawCategory && rawCategory._id
            ? String(rawCategory._id)
            : rawCategory
            ? rawCategory.toString()
            : "";
        const categoryName = rawCategory && typeof rawCategory === "object" && "name" in rawCategory && typeof rawCategory.name === "string"
            ? rawCategory.name
            : undefined;

        const rawCreatedBy = (document as unknown as { createdBy?: { _id?: unknown; fullName?: string } | { toString(): string } }).createdBy;
        const createdById = rawCreatedBy && typeof rawCreatedBy === "object" && "_id" in rawCreatedBy && rawCreatedBy._id
            ? String(rawCreatedBy._id)
            : rawCreatedBy
            ? rawCreatedBy.toString()
            : "";
        const reporterName = rawCreatedBy && typeof rawCreatedBy === "object" && "fullName" in rawCreatedBy && typeof rawCreatedBy.fullName === "string"
            ? rawCreatedBy.fullName
            : undefined;

        const baseTimestamp = document.updatedAt || document.createdAt || new Date();
        const proposalOpenedAt = document.proposalOpenedAt || (document.status === IssueStatus.VERIFIED ? baseTimestamp : undefined);
        const proposalDeadlineAt = document.proposalDeadlineAt || (document.status === IssueStatus.VERIFIED ? new Date(baseTimestamp.getTime() + 5 * 24 * 60 * 60 * 1000) : undefined);
        const proposalWindowStatus = document.proposalWindowStatus || (
            document.status === IssueStatus.VERIFIED
                ? (proposalDeadlineAt && new Date() >= proposalDeadlineAt ? ProposalWindowStatus.CLOSED : ProposalWindowStatus.OPEN)
                : undefined
        );

        return {
            id: document._id.toString(),
            createdBy: createdById,
            reporterName,
            title: document.title,
            description: document.description,
            category: categoryId,
            categoryName,
            images: document.images || [],
            visibility: document.visibility,
            location: document.location,
            status: document.status,
            rejectionReason: document.rejectionReason,
            proposalOpenedAt,
            proposalDeadlineAt,
            proposalWindowStatus,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
    }
}

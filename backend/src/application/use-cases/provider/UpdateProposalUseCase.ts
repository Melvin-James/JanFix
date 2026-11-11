import { Types } from "mongoose";
import type { IUpdateProposalUseCase } from "../usecase interfaces/provider/IUpdateProposalUseCase.js";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.js";
import type { UpdateProposalDTO } from "../../dto/proposal/SubmitProposalDTO.js";
import type { ProposalResponseDTO } from "../../dto/proposal/ProposalResponseDTO.js";
import type { BudgetItem } from "../../../domain/entities/Proposal.js";
import { ProposalStatus } from "../../../domain/enums/ProposalStatus.js";
import { ProposalWindowStatus } from "../../../domain/enums/ProposalWindowStatus.js";
import { IssueStatus } from "../../../domain/enums/IssueStatus.js";
import { ProviderType } from "../../../domain/enums/ProviderType.js";
import { NgoParticipationMode } from "../../../domain/enums/NgoParticipationMode.js";
import { ProposalAppMapper } from "../../mappers/ProposalAppMapper.js";
import ApiError from "../../../shared/utils/apiError.js";
import { HttpStatusCode } from "../../../shared/enums/HttpStatusCode.js";

function parseTimeToMinutes(timeStr: string): number {
    const parts = timeStr.split(":").map(Number);
    const hours = parts[0] ?? 0;
    const minutes = parts[1] ?? 0;
    return hours * 60 + minutes;
}

export class UpdateProposalUseCase implements IUpdateProposalUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly proposalRepository: IProposalRepository
    ) {}

    async execute(
        issueId: string,
        providerId: string,
        dto: UpdateProposalDTO,
        serverNow: Date = new Date()
    ): Promise<ProposalResponseDTO> {
        if (!issueId || !Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue identifier");
        }
        if (!providerId || !Types.ObjectId.isValid(providerId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid provider identifier");
        }

        // 1. Verify Issue existence and deadline
        const issue = await this.issueRepository.findById(issueId);
        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        if (issue.status !== IssueStatus.VERIFIED) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                "Proposals can only be updated for verified issues"
            );
        }

        const fallbackDeadline = new Date(
            (issue.updatedAt || issue.createdAt || serverNow).getTime() + 5 * 24 * 60 * 60 * 1000
        );
        const proposalDeadline = issue.proposalDeadlineAt || fallbackDeadline;

        if (
            issue.proposalWindowStatus === ProposalWindowStatus.CLOSED ||
            issue.proposalWindowStatus === ProposalWindowStatus.CANCELLED ||
            serverNow >= proposalDeadline
        ) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                "The proposal submission window for this issue has closed. Edits are no longer permitted."
            );
        }

        // 2. Retrieve existing proposal
        const proposal = await this.proposalRepository.findByIssueAndProvider(issueId, providerId);
        if (!proposal) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "No proposal found for this issue");
        }

        if (proposal.status !== ProposalStatus.SUBMITTED) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                "Withdrawn proposals cannot be updated. Please submit a new proposal."
            );
        }

        const updates: Record<string, unknown> = {};   

        // 4. Validate Team Size if provided
        if (dto.estimatedTeamSize !== undefined) {
            const teamSize = Number(dto.estimatedTeamSize);
            if (!Number.isInteger(teamSize) || teamSize <= 0) {
                throw new ApiError(HttpStatusCode.BAD_REQUEST, "Estimated team size must be a positive integer");
            }
            updates.estimatedTeamSize = teamSize;
        }

        // 5. Validate Duration if provided
        if (dto.estimatedDurationHours !== undefined) {
            const durationHours = Number(dto.estimatedDurationHours);
            if (isNaN(durationHours) || durationHours <= 0) {
                throw new ApiError(HttpStatusCode.BAD_REQUEST, "Estimated duration must be greater than 0 hours");
            }
            updates.estimatedDurationHours = durationHours;
        }

        // 6. Validate Budget Items & Total if provided
        if (dto.budgetItems !== undefined) {
            if (!Array.isArray(dto.budgetItems) || dto.budgetItems.length === 0) {
                throw new ApiError(HttpStatusCode.BAD_REQUEST, "At least one budget item is required");
            }

            const mappedBudgetItems: BudgetItem[] = [];
            let totalBudgetPaise = 0;

            for (const item of dto.budgetItems) {
                const heading = item.heading?.trim();
                if (!heading || heading.length > 100) {
                    throw new ApiError(
                        HttpStatusCode.BAD_REQUEST,
                        "Each budget item must have a valid heading (maximum 100 characters)"
                    );
                }

                let amountPaise: number;
                if (typeof item.amountPaise === "number" && item.amountPaise > 0) {
                    amountPaise = Math.round(item.amountPaise);
                } else if (typeof item.amountRupees === "number" && item.amountRupees > 0) {
                    amountPaise = Math.round(item.amountRupees * 100);
                } else {
                    throw new ApiError(
                        HttpStatusCode.BAD_REQUEST,
                        `Invalid amount for budget item "${heading}". Amount must be positive.`
                    );
                }

                mappedBudgetItems.push({ heading, amountPaise });
                totalBudgetPaise += amountPaise;
            }

            updates.budgetItems = mappedBudgetItems;
            updates.totalBudgetPaise = totalBudgetPaise;
        }

        // 7. Validate Execution Roadmap if provided
        if (dto.executionRoadmap !== undefined) {
            if (!Array.isArray(dto.executionRoadmap) || dto.executionRoadmap.length === 0) {
                throw new ApiError(HttpStatusCode.BAD_REQUEST, "At least one execution roadmap item is required");
            }

            const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
            const parsedRoadmap: {
                heading: string;
                description: string;
                startTime: string;
                endTime: string;
                startMin: number;
                endMin: number;
            }[] = [];

            for (const item of dto.executionRoadmap) {
                const heading = item.heading?.trim();
                const description = item.description?.trim();
                const startTime = item.startTime?.trim();
                const endTime = item.endTime?.trim();

                if (!heading || heading.length > 100) {
                    throw new ApiError(HttpStatusCode.BAD_REQUEST, "Roadmap activity heading is required (max 100 chars)");
                }
                if (!description || description.length > 1000) {
                    throw new ApiError(HttpStatusCode.BAD_REQUEST, "Roadmap activity description is required (max 1000 chars)");
                }
                if (!startTime || !timeRegex.test(startTime)) {
                    throw new ApiError(HttpStatusCode.BAD_REQUEST, `Invalid start time format "${startTime}". Use HH:mm.`);
                }
                if (!endTime || !timeRegex.test(endTime)) {
                    throw new ApiError(HttpStatusCode.BAD_REQUEST, `Invalid end time format "${endTime}". Use HH:mm.`);
                }

                const startMin = parseTimeToMinutes(startTime);
                const endMin = parseTimeToMinutes(endTime);

                if (endMin <= startMin) {
                    throw new ApiError(
                        HttpStatusCode.BAD_REQUEST,
                        `Roadmap item "${heading}" has end time (${endTime}) before or equal to start time (${startTime})`
                    );
                }

                parsedRoadmap.push({
                    heading,
                    description,
                    startTime,
                    endTime,
                    startMin,
                    endMin,
                });
            }

            parsedRoadmap.sort((a, b) => a.startMin - b.startMin);

            for (let i = 0; i < parsedRoadmap.length - 1; i++) {
                const current = parsedRoadmap[i]!;
                const next = parsedRoadmap[i + 1]!;
                if (current.endMin > next.startMin) {
                    throw new ApiError(
                        HttpStatusCode.BAD_REQUEST,
                        `Roadmap schedule conflict: "${current.heading}" (${current.startTime} - ${current.endTime}) overlaps with "${next.heading}" (${next.startTime} - ${next.endTime})`
                    );
                }
            }

            updates.executionRoadmap = parsedRoadmap.map((item, idx) => ({
                heading: item.heading,
                description: item.description,
                startTime: item.startTime,
                endTime: item.endTime,
                order: idx,
            }));
        }

        // 8. Validate NGO Details if applicable
        if (proposal.providerType === ProviderType.NGO && dto.ngoDetails !== undefined) {
            if (typeof dto.ngoDetails.requiresFunding !== "boolean") {
                throw new ApiError(HttpStatusCode.BAD_REQUEST, "Please specify whether funding is required from JanFix");
            }
            if (!Object.values(NgoParticipationMode).includes(dto.ngoDetails.participationMode)) {
                throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid community participation mode");
            }
            if (dto.ngoDetails.participationMode === NgoParticipationMode.OPEN_COMMUNITY) {
                const participants = Number(dto.ngoDetails.expectedParticipants);
                if (!Number.isInteger(participants) || participants <= 0) {
                    throw new ApiError(
                        HttpStatusCode.BAD_REQUEST,
                        "Expected community participants capacity must be a positive integer"
                    );
                }
            }
            if (typeof dto.ngoDetails.requiresCommunityChat !== "boolean") {
                throw new ApiError(HttpStatusCode.BAD_REQUEST, "Please specify whether community chat is requested");
            }

            updates.ngoDetails = {
                requiresFunding: dto.ngoDetails.requiresFunding,
                participationMode: dto.ngoDetails.participationMode,
                expectedParticipants:
                    dto.ngoDetails.participationMode === NgoParticipationMode.OPEN_COMMUNITY
                        ? Number(dto.ngoDetails.expectedParticipants)
                        : undefined,
                requiresCommunityChat: dto.ngoDetails.requiresCommunityChat,
            };
        }

        const updated = await this.proposalRepository.update(proposal.id!, updates);
        if (!updated) {
            throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "Failed to update proposal");
        }

        return ProposalAppMapper.toResponse(updated);
    }
}

export default UpdateProposalUseCase;


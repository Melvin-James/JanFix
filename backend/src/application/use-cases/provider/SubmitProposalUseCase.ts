import { Types } from "mongoose";
import type { ISubmitProposalUseCase } from "../usecase interfaces/provider/ISubmitProposalUseCase.js";
import type { IIssueRepository } from "../../../domain/interface/IIssueRepository.js";
import type { IProposalRepository } from "../../../domain/interface/IProposalRepository.js";
import type { IUserRepository } from "../../../domain/interface/IUserRepository.js";
import type { SubmitProposalDTO } from "../../dto/proposal/SubmitProposalDTO.js";
import type { ProposalResponseDTO } from "../../dto/proposal/ProposalResponseDTO.js";
import type { BudgetItem, ExecutionRoadmapItem, ProposalNgoDetails } from "../../../domain/entities/Proposal.js";
import { ProposalStatus } from "../../../domain/enums/ProposalStatus.js";
import { ProposalWindowStatus } from "../../../domain/enums/ProposalWindowStatus.js";
import { IssueStatus } from "../../../domain/enums/IssueStatus.js";
import { ProviderType } from "../../../domain/enums/ProviderType.js";
import { Role } from "../../../domain/enums/Role.js";
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

export class SubmitProposalUseCase implements ISubmitProposalUseCase {
    constructor(
        private readonly issueRepository: IIssueRepository,
        private readonly proposalRepository: IProposalRepository,
        private readonly userRepository: IUserRepository
    ) {}

    async execute(
        issueId: string,
        providerId: string,
        dto: SubmitProposalDTO,
        serverNow: Date = new Date()
    ): Promise<ProposalResponseDTO> {
        if (!issueId || !Types.ObjectId.isValid(issueId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid issue identifier");
        }
        if (!providerId || !Types.ObjectId.isValid(providerId)) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid provider identifier");
        }

        // 1. Verify Issue existence and eligibility
        const issue = await this.issueRepository.findById(issueId);
        if (!issue) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Issue not found");
        }

        if (issue.status !== IssueStatus.VERIFIED) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                "Proposals can only be submitted for verified issues"
            );
        }

        // 2. Enforce 5-day proposal submission window
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
                "The proposal submission window for this issue has closed"
            );
        }

        // 3. Verify Provider profile & derive authoritative providerType
        const user = await this.userRepository.findById(providerId);
        if (!user) {
            throw new ApiError(HttpStatusCode.NOT_FOUND, "Provider account not found");
        }

        if (
            !user.roles.includes(Role.SERVICE_PROVIDER) ||
            user.accountStatus !== "ACTIVE" ||
            user.providerProfile?.status?.providerStatus !== "ACTIVE"
        ) {
            throw new ApiError(
                HttpStatusCode.FORBIDDEN,
                "You must have an approved and active service provider account to submit proposals"
            );
        }

        const providerType = user.providerProfile?.identity?.providerType;
        if (!providerType || !Object.values(ProviderType).includes(providerType)) {
            throw new ApiError(
                HttpStatusCode.FORBIDDEN,
                "Provider identity type is incomplete or invalid"
            );
        }

        // 4. Validate Expected Start Date (strictly future)
        const startDate = new Date(dto.expectedStartDate);
        if (isNaN(startDate.getTime())) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Invalid expected start date");
        }
        if (startDate.getTime() <= serverNow.getTime()) {
            throw new ApiError(
                HttpStatusCode.BAD_REQUEST,
                "Expected start date must be in the future"
            );
        }

        // 5. Validate Team Size & Duration
        const teamSize = Number(dto.estimatedTeamSize);
        if (!Number.isInteger(teamSize) || teamSize <= 0) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Estimated team size must be a positive integer");
        }

        const durationHours = Number(dto.estimatedDurationHours);
        if (isNaN(durationHours) || durationHours <= 0) {
            throw new ApiError(HttpStatusCode.BAD_REQUEST, "Estimated duration must be greater than 0 hours");
        }

        // 6. Validate Budget Items & Compute Total Budget in Paise
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

            if (amountPaise <= 0) {
                throw new ApiError(
                    HttpStatusCode.BAD_REQUEST,
                    `Budget item "${heading}" must have an amount greater than zero`
                );
            }

            mappedBudgetItems.push({
                heading,
                amountPaise,
            });
            totalBudgetPaise += amountPaise;
        }

        // 7. Validate Execution Roadmap (Daily Schedule Timetable)
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

        // Chronologically sort roadmap items
        parsedRoadmap.sort((a, b) => a.startMin - b.startMin);

        // Check for overlapping intervals in the daily timetable
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

        const mappedRoadmap: ExecutionRoadmapItem[] = parsedRoadmap.map((item, idx) => ({
            heading: item.heading,
            description: item.description,
            startTime: item.startTime,
            endTime: item.endTime,
            order: idx,
        }));

        // 8. Conditional NGO Details Validation
        let mappedNgoDetails: ProposalNgoDetails | undefined = undefined;

        if (providerType === ProviderType.NGO) {
            if (!dto.ngoDetails) {
                throw new ApiError(HttpStatusCode.BAD_REQUEST, "NGO-specific proposal details are required");
            }
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

            mappedNgoDetails = {
                requiresFunding: dto.ngoDetails.requiresFunding,
                participationMode: dto.ngoDetails.participationMode,
                expectedParticipants:
                    dto.ngoDetails.participationMode === NgoParticipationMode.OPEN_COMMUNITY
                        ? Number(dto.ngoDetails.expectedParticipants)
                        : undefined,
                requiresCommunityChat: dto.ngoDetails.requiresCommunityChat,
            };
        }

        // 9. Check for Existing Proposal (Submission vs Resubmission/Duplicate)
        const existingProposal = await this.proposalRepository.findByIssueAndProvider(issueId, providerId);

        if (existingProposal) {
            if (existingProposal.status === ProposalStatus.SUBMITTED) {
                throw new ApiError(
                    HttpStatusCode.CONFLICT,
                    "A proposal has already been submitted for this issue. You can update your existing proposal before the deadline."
                );
            }

            // Resubmit previously withdrawn proposal
            const updated = await this.proposalRepository.update(existingProposal.id!, {
                status: ProposalStatus.SUBMITTED,
                issueSnapshot: {
                    title: issue.title,
                    description: issue.description,
                },
                estimatedTeamSize: teamSize,
                estimatedDurationHours: durationHours,
                expectedStartDate: startDate,
                budgetItems: mappedBudgetItems,
                totalBudgetPaise,
                executionRoadmap: mappedRoadmap,
                ngoDetails: mappedNgoDetails,
                submittedAt: serverNow,
                withdrawnAt: undefined,
            });

            if (!updated) {
                throw new ApiError(HttpStatusCode.INTERNAL_SERVER_ERROR, "Failed to submit proposal");
            }

            return ProposalAppMapper.toResponse(updated);
        }

        // 10. Create New Proposal
        const created = await this.proposalRepository.create({
            issueId,
            providerId,
            providerType,
            status: ProposalStatus.SUBMITTED,
            issueSnapshot: {
                title: issue.title,
                description: issue.description,
            },
            estimatedTeamSize: teamSize,
            estimatedDurationHours: durationHours,
            expectedStartDate: startDate,
            budgetItems: mappedBudgetItems,
            totalBudgetPaise,
            executionRoadmap: mappedRoadmap,
            ngoDetails: mappedNgoDetails,
            submittedAt: serverNow,
        });

        return ProposalAppMapper.toResponse(created);
    }
}

export default SubmitProposalUseCase;


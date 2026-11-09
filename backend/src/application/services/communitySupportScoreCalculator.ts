import { AIOverallClassification } from "../../domain/enums/AIOverallClassification.js";
import { CommentClassification } from "../../domain/enums/CommentClassification.js";
import type { AICommentClassificationItem } from "../../domain/entities/IssueAIAnalysis.js";

export interface ScoreCalculationResult {
    supportCount: number;
    challengeCount: number;
    neutralCount: number;
    totalAnalyzed: number;
    score: number | null;
    overallClassification: AIOverallClassification;
}

/**
 * Calculates the Community Support Score and Overall Classification
 * strictly adhering to Phase 4 specifications.
 */
export function calculateCommunitySupportScore(
    items: AICommentClassificationItem[]
): ScoreCalculationResult {
    let supportCount = 0;
    let challengeCount = 0;
    let neutralCount = 0;

    for (const item of items) {
        if (item.classification === CommentClassification.SUPPORTS_REPORT) {
            supportCount++;
        } else if (item.classification === CommentClassification.CHALLENGES_REPORT) {
            challengeCount++;
        } else {
            neutralCount++;
        }
    }

    const meaningfulCount = supportCount + challengeCount;
    const totalAnalyzed = meaningfulCount + neutralCount;

    if (meaningfulCount === 0) {
        return {
            supportCount,
            challengeCount,
            neutralCount,
            totalAnalyzed,
            score: null,
            overallClassification: AIOverallClassification.INSUFFICIENT_DATA,
        };
    }

    const rawScore = 50 + 50 * ((supportCount - challengeCount) / meaningfulCount);
    const score = Math.min(100, Math.max(0, Math.round(rawScore)));

    let overallClassification: AIOverallClassification;
    if (score > 50) {
        overallClassification = AIOverallClassification.COMMUNITY_LEANING_SUPPORT;
    } else if (score < 50) {
        overallClassification = AIOverallClassification.COMMUNITY_LEANING_CHALLENGE;
    } else {
        overallClassification = AIOverallClassification.MIXED_FEEDBACK;
    }

    return {
        supportCount,
        challengeCount,
        neutralCount,
        totalAnalyzed,
        score,
        overallClassification,
    };
}


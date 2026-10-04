import mongoose, { type Document } from "mongoose";

import { Role } from "../../domain/enums/Role.js";
import { AuthProvider } from "../../domain/enums/AuthProvider.js";

import { providerProfileSchema } from "../database/schemas/providerProfileSchema.js";

import { AccountStatus } from "../../domain/enums/AccountStatus.js";

import type { ProviderType } from "../../domain/enums/ProviderType.js";
import type { ApplicationStatus } from "../../domain/enums/ApplicationStatus.js";
import type { ProviderStatus } from "../../domain/enums/ProviderStatus.js";

// ─── Typed sub-document shapes ─────────────────────────────────────────────

export interface UploadedFileDoc {
    key: string;
    url: string;
    originalName: string;
    mimeType: string;
    size: number;
}

export interface ProviderIdentityDoc {
    providerType?: ProviderType;
    providerName?: string;
    responsiblePersonName?: string;
    address?: string;
    phone?: string;
}

export interface ProviderDocumentsDoc {
    identityProof?: UploadedFileDoc;
    profileImage?: UploadedFileDoc;
    ngoRegistrationDocument?: UploadedFileDoc;
    logo?: UploadedFileDoc;
    previousCommunityPhotos?: UploadedFileDoc[];
}

export interface ProviderWorkPreferencesDoc {
    categoriesWillingToWork?: string[];
    websiteLinks?: string[];
}

export interface VolunteerGroupProfileDoc {
    memberCount: number;
}

export interface OrganizationProfileDoc {
    memberCount: number;
}

export interface ProviderStatusDoc {
    applicationStatus: ApplicationStatus;
    providerStatus?: ProviderStatus;
    submittedAt: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
}

export interface ProviderProfileDoc {
    identity?: ProviderIdentityDoc;
    documents?: ProviderDocumentsDoc;
    workPreferences?: ProviderWorkPreferencesDoc;
    volunteerGroupProfile?: VolunteerGroupProfileDoc;
    organizationProfile?: OrganizationProfileDoc;
    status: ProviderStatusDoc;
}

/**
 * The Mongoose document shape for a User — used by UserMapper.
 * Defined here as a plain interface extending Document so the mapper
 * can reference concrete sub-document types without any.
 */
export interface UserDocument extends Document {
    fullName: string;
    email: string;
    password?: string;
    roles: Role[];
    isVerified: boolean;
    authProvider: AuthProvider;
    accountStatus: AccountStatus;
    googleId?: string;
    providerProfile?: ProviderProfileDoc;
}

// ─── Schema ─────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
{
    fullName: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    password: {
        type: String,
        required: false,
    },

    roles: {
        type: [{
            type: String,
            enum: Object.values(Role),
        }],
        default: [Role.USER],
    },

    isVerified: {
        type: Boolean,
        default: false,
    },

    authProvider: {
        type: String,
        enum: Object.values(AuthProvider),
        default: AuthProvider.LOCAL,
    },

    accountStatus: {
        type: String,
        enum: Object.values(AccountStatus),
        default: AccountStatus.ACTIVE,
        required: true,
    },

    googleId: {
        type: String,
        sparse: true,
    },

    providerProfile: {
        type: providerProfileSchema,
        default: undefined,
    }
},
{
    timestamps: true,
});

const UserModel = mongoose.model<UserDocument>("User", userSchema);

export default UserModel;
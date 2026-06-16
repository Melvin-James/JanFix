import mongoose, { Schema } from "mongoose";

import { ProviderType } from "../../domain/enums/ProviderType.js";

import { VerificationStatus } from "../../domain/enums/VerificationStatus.js";

import { OnboardingStatus } from "../../domain/enums/OnboardingStatus.js";

const serviceProviderSchema =
  new Schema(
    {

      userId: {

        type: Schema.Types.ObjectId,

        ref: "User",

        required: true,

        unique: true,
      },

      providerType: {

        type: String,

        enum:
          Object.values(
            ProviderType
          ),
      },

      onboardingStatus: {

        type: String,

        enum:
          Object.values(
            OnboardingStatus
          ),

        default:
          OnboardingStatus.STEP_1,
      },

      verificationStatus: {

        type: String,

        enum:
          Object.values(
            VerificationStatus
          ),

        default:
          VerificationStatus.PENDING,
      },

      providerName: {

        type: String,
      },

      responsiblePersonName: {

        type: String,
      },

      address: {

        type: String,
      },

      phone: {

        type: String,
      },

      governmentId: {

        type: String,
      },

      profileImage: {

        type: String,
      },

      categoriesWillingToWork: [
        {
          type: String,
        },
      ],

      websiteLinks: [
        {
          type: String,
        },
      ],

      previousCommunityPhotos: [
        {
          type: String,
        },
      ],

      volunteerGroupProfile: {

        memberCount: {

          type: Number,
        },

        logo: {

          type: String,
        },
      },

      organizationProfile: {

        memberCount: {

          type: Number,
        },

        ngoRegistrationDocument: {

          type: String,
        },

        logo: {

          type: String,
        },
      },
    },

    {

      timestamps: true,
    }
  );

const ServiceProviderModel =
  mongoose.model(
    "ServiceProvider",
    serviceProviderSchema
  );

export default ServiceProviderModel;
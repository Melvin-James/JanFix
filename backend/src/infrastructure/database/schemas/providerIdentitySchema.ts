import { Schema } from "mongoose";

import { ProviderType } from "../../../domain/enums/ProviderType.js";

export const providerIdentitySchema = new Schema(
    {

        providerType: {

            type: String,

            enum: Object.values(ProviderType),
        },

        providerName: String,

        responsiblePersonName: String,

        address: String,

        phone: String,

    },
    {
        _id: false,
    }
);
export const ProviderType = {

    INDIVIDUAL: "INDIVIDUAL",

    VOLUNTEER_GROUP: "VOLUNTEER_GROUP",

    NGO: "NGO",
} as const

export type ProviderType = typeof ProviderType[keyof typeof ProviderType];
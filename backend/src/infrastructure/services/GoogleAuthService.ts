import { OAuth2Client } from "google-auth-library";

import { env } from "../config/env.js";

import type {
    GoogleUser,
    IGoogleAuthService,
} from "../../domain/interface/IGoogleAuthService.js";

class GoogleAuthService implements IGoogleAuthService {

    private client: OAuth2Client;

    constructor() {
        this.client = new OAuth2Client(
            env.GOOGLE_CLIENT_ID
        );
    }

    async verifyCredential(
        credential: string
    ): Promise<GoogleUser> {

        const ticket =
            await this.client.verifyIdToken({
                idToken: credential,
                audience: env.GOOGLE_CLIENT_ID,
            });

        const payload =
            ticket.getPayload();

        if (!payload) {
            throw new Error(
                "Invalid Google credential"
            );
        }

        if (
            !payload.sub ||
            !payload.email ||
            !payload.name
        ) {
            throw new Error(
                "Incomplete Google account information"
            );
        }
        
        return {
            googleId: payload.sub,
            email: payload.email,
            fullName: payload.name,
            emailVerified: payload.email_verified === true,
            ...(payload.picture && { picture: payload.picture}),
        };
    }
}

export default GoogleAuthService;
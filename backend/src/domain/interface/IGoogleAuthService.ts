export interface GoogleUser {
    googleId: string;
    email: string;
    fullName: string;
    emailVerified: boolean;
    picture?: string;
}

export interface IGoogleAuthService {
    verifyCredential(
        credential: string
    ): Promise<GoogleUser>
}
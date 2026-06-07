export interface LoginResponseDTO {

    accessToken: string;

    user: {

        id: string;

        name: string;

        email: string;

        role: string;

        isVerified: boolean;
    };
}
export interface IJwtService {

    generateAccessToken(userId: string, role: string): string;

    generateRefreshToken(userId: string): string;

    verifyAccessToken(token: string): any;

    verifyRefreshToken(token: string): any;
}
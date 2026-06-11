export interface AuthUser {

  id: string;

  email: string;

  role: "USER" | "SERVICE_PROVIDER";

  isVerified: boolean;
}
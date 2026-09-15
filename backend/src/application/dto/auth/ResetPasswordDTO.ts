export interface ResetPasswordDTO {
    resetToken: string;
    newPassword: string;
    confirmPassword: string;
}
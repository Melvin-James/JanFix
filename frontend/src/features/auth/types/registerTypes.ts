export interface RegisterFormData {

  email: string;

  password: string;

  confirmPassword: string;

  role:
    "USER" |
    "SERVICE_PROVIDER";
}
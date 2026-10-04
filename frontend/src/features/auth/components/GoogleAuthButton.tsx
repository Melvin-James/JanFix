import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../services/authService";
import { useAuthStore } from "../../../store/authStore";
import axios from "axios";

export interface GoogleAuthButtonProps {
    onError: (errorMessage: string) => void;
    onLoadingChange?: (loading: boolean) => void;
}

export function GoogleAuthButton({ onError, onLoadingChange }: GoogleAuthButtonProps) {
    const setUser = useAuthStore((state) => state.setUser);
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            onLoadingChange?.(true);
            onError("");

            const credential = credentialResponse.credential;
            if (!credential) {
                throw new Error("Google credential was not received");
            }

            const response = await googleLogin(credential);
            if (response.data?.user) {
                setUser(response.data.user);
                navigate("/home");
            }
        } catch (err: unknown) {
            console.error("Google authentication error:", err);
            if (axios.isAxiosError(err)) {
                onError(err.response?.data?.message || "Google sign-up failed");
            } else if (err instanceof Error) {
                onError(err.message);
            } else {
                onError("Google sign-up failed");
            }
        } finally {
            onLoadingChange?.(false);
        }
    };

    return (
        <div className="w-full">
            <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
                <div className="h-px flex-1 bg-slate-200" />
                <span>OR</span>
                <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex justify-center">
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => onError("Google sign-up failed")}
                    width="100%"
                />
            </div>
        </div>
    );
}

export default GoogleAuthButton;

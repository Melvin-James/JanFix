import { useEffect } from "react";

import { useAuthStore } from "../store/authStore";

import axiosInstance from "../api/axios";

function AuthInitializer() {

    const setAuthLoading = useAuthStore((state) => state.setAuthLoading);

    const setUser = useAuthStore((state) => state.setUser);

    const clearAuth = useAuthStore((state) => state.clearAuth)

    useEffect(() => {
        const restoreSession = async () => {

            try {

                const response = await axiosInstance.get("/auth/me");

                const { user } = response.data.data;

                setUser(user);

            } catch (error) {

                clearAuth();

            }
            finally {

                setAuthLoading(false);
            }

        };

        restoreSession();

    }, [setUser, clearAuth, setAuthLoading]);

    return null;

}

export default AuthInitializer;
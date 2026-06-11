import { useEffect } from "react";

import { useAuthStore } from "../store/authStore";

import axiosInstance from "../api/axios";

function AuthInitializer() {

    const setAuthLoading = useAuthStore((state) => state.setAuthLoading);

    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const restoreSession = async () => {

            try {

                const response = await axiosInstance.post("/auth/refresh-token");

                const { accessToken, user } = response.data.data;

                setAuth(accessToken, user);

            } catch (error) {

                console.log("No active session");

            }
            finally {

                setAuthLoading(false);
            }

        };

        restoreSession();

    }, []);

    return null;

}

export default AuthInitializer;
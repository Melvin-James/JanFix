import { useEffect, useState, useCallback } from "react";

export interface UseCountdownReturn {
    secondsLeft: number;
    isRunning: boolean;
    start: (seconds?: number) => void;
    reset: () => void;
}

export function useCountdown(initialSeconds: number = 30): UseCountdownReturn {
    const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
    const [isRunning, setIsRunning] = useState<boolean>(initialSeconds > 0);

    useEffect(() => {
        if (!isRunning || secondsLeft <= 0) {
            setIsRunning(false);
            return;
        }

        const timer = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    setIsRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isRunning, secondsLeft]);

    const start = useCallback((seconds?: number) => {
        setSecondsLeft(seconds ?? initialSeconds);
        setIsRunning(true);
    }, [initialSeconds]);

    const reset = useCallback(() => {
        setSecondsLeft(0);
        setIsRunning(false);
    }, []);

    return { secondsLeft, isRunning, start, reset };
}

export default useCountdown;

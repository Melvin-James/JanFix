import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

export interface OtpInputProps {
    length?: number;
    value: string;
    onChange: (otp: string) => void;
    disabled?: boolean;
}

export function OtpInput({
    length = 6,
    value,
    onChange,
    disabled = false,
}: OtpInputProps) {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    const digits = Array.from({ length }, (_, i) => value[i] || "");

    const focusInput = (index: number) => {
        const clampedIndex = Math.max(0, Math.min(index, length - 1));
        inputsRef.current[clampedIndex]?.focus();
    };

    const handleChange = (index: number, inputValue: string) => {
        const digit = inputValue.replace(/\D/g, "").slice(-1);
        const newDigits = [...digits];
        newDigits[index] = digit;
        const newOtp = newDigits.join("");
        onChange(newOtp);

        if (digit && index < length - 1) {
            focusInput(index + 1);
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (digits[index]) {
                const newDigits = [...digits];
                newDigits[index] = "";
                onChange(newDigits.join(""));
            } else if (index > 0) {
                focusInput(index - 1);
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            focusInput(index - 1);
        } else if (e.key === "ArrowRight" && index < length - 1) {
            focusInput(index + 1);
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, length);

        if (!pastedData) return;

        onChange(pastedData);
        focusInput(Math.min(pastedData.length, length - 1));
    };

    return (
        <div className="flex items-center justify-between gap-2 sm:gap-3">
            {digits.map((digit, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        inputsRef.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    disabled={disabled}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg border border-gray-300 bg-white text-center text-xl font-semibold text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
                />
            ))}
        </div>
    );
}

export default OtpInput;

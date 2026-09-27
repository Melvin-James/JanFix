import React from "react";

export interface FilterOption {
    value: string;
    label: string;
}

export interface AdminFilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    className?: string;
}

export const AdminFilterSelect: React.FC<AdminFilterSelectProps> = ({
    value,
    onChange,
    options,
    className = "",
}) => {
    return (
        <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={`h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${className}`.trim()}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

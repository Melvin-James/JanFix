import React from "react";

export interface AdminSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const AdminSearchBar: React.FC<AdminSearchBarProps> = ({
    value,
    onChange,
    placeholder = "Search...",
    className = "",
}) => {
    
    return (
        <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className={`h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${className}`.trim()}
        />
    );
};

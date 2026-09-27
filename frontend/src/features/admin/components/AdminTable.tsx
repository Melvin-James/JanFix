import React from "react";

export interface TableColumn {
    header: string;
    align?: "left" | "right" | "center";
}

export interface AdminTableProps {
    columns: (string | TableColumn)[];
    children: React.ReactNode;
    minWidth?: string;
    className?: string;
}

export const AdminTable: React.FC<AdminTableProps> = ({
    columns,
    children,
    minWidth = "min-w-[900px]",
    className = "",
}) => {
    return (
        <div className={`overflow-x-auto ${className}`.trim()}>
            <table className={`w-full ${minWidth}`}>
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                        {columns.map((col, index) => {
                            const header = typeof col === "string" ? col : col.header;
                            const align = typeof col === "string" ? "left" : col.align || "left";
                            const alignClass =
                                align === "right"
                                    ? "text-right"
                                    : align === "center"
                                    ? "text-center"
                                    : "text-left";

                            return (
                                <th
                                    key={index}
                                    className={`px-6 py-3 ${alignClass} text-xs font-semibold uppercase tracking-wide text-slate-500`}
                                >
                                    {header}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">{children}</tbody>
            </table>
        </div>
    );
};

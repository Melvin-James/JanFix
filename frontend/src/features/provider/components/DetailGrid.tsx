import type React from "react";

export interface DetailGridProps {
  columns?: 1 | 2 | 3 | 4;
  children: React.ReactNode;
  className?: string;
}

const columnStyles: Record<1 | 2 | 3 | 4, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function DetailGrid({
  columns = 2,
  children,
  className = "",
}: DetailGridProps) {
  return (
    <div className={`grid gap-6 ${columnStyles[columns]} ${className}`}>
      {children}
    </div>
  );
}

export default DetailGrid;

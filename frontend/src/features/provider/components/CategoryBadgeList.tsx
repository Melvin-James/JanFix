
import { useEffect, useState } from "react";
import { getActiveIssueCategories } from "../../issues/services/issueService";

export interface CategoryBadgeListProps {
  categories?: string[] | null;
  emptyText?: string;
  className?: string;
}

export function CategoryBadgeList({
  categories,
  emptyText = "Not provided",
  className = "",
}: CategoryBadgeListProps) {
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const hasIds = categories?.some((c) => /^[0-9a-fA-F]{24}$/.test(c));
    if (!hasIds) return;

    let cancelled = false;
    getActiveIssueCategories()
      .then((cats) => {
        if (!cancelled) {
          const map: Record<string, string> = {};
          cats.forEach((cat) => {
            map[cat.id] = cat.name;
          });
          setCategoryMap(map);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [categories]);

  if (!categories || categories.length === 0) {
    return <span className="text-sm text-slate-400">{emptyText}</span>;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map((category) => {
        const displayName = categoryMap[category] || category;
        return (
          <span
            key={category}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
          >
            {displayName}
          </span>
        );
      })}
    </div>
  );
}

export default CategoryBadgeList;

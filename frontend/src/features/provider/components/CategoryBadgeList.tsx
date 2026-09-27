
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
  if (!categories || categories.length === 0) {
    return <span className="text-sm text-slate-400">{emptyText}</span>;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map((category) => (
        <span
          key={category}
          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
        >
          {category}
        </span>
      ))}
    </div>
  );
}

export default CategoryBadgeList;

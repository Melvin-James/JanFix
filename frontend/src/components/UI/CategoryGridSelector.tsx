import type React from "react";
import {
  Droplets,
  Leaf,
  Sprout,
  Trash2,
  Folder,
} from "lucide-react";

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  icon?: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

export interface CategoryGridSelectorProps {
  categories: (CategoryItem | string)[];
  value: string | string[];
  onChange: (value: any) => void;
  mode?: "single" | "multiple";
  layout?: "compact" | "card";
  columnsClassName?: string;
  className?: string;
}

export function getCategoryIcon(name: string) {
  const normalized = name.toLowerCase();
  if (
    normalized.includes("water") ||
    normalized.includes("drain") ||
    normalized.includes("leak")
  ) {
    return Droplets;
  }
  if (
    normalized.includes("waste") ||
    normalized.includes("garbage") ||
    normalized.includes("clean") ||
    normalized.includes("trash")
  ) {
    return Trash2;
  }
  if (
    normalized.includes("tree") ||
    normalized.includes("park") ||
    normalized.includes("plant") ||
    normalized.includes("garden") ||
    normalized.includes("green") ||
    normalized.includes("grass")
  ) {
    return Leaf;
  }
  if (
    normalized.includes("road") ||
    normalized.includes("pothole") ||
    normalized.includes("light") ||
    normalized.includes("urban")
  ) {
    return Sprout;
  }
  return Folder;
}

export function CategoryGridSelector({
  categories,
  value,
  onChange,
  mode = "single",
  layout = "card",
  columnsClassName = "grid-cols-2 gap-2.5 sm:grid-cols-3",
  className = "",
}: CategoryGridSelectorProps) {
  const isSelected = (item: CategoryItem) => {
    if (mode === "multiple" && Array.isArray(value)) {
      return value.includes(item.id) || value.includes(item.name);
    }
    return value === item.id || value === item.name;
  };

  const handleSelect = (item: CategoryItem) => {
    if (mode === "multiple") {
      const arr = Array.isArray(value) ? value : [];
      const hasItem = arr.includes(item.id) || arr.includes(item.name);
      if (hasItem) {
        onChange(arr.filter((v) => v !== item.id && v !== item.name));
      } else {
        onChange([...arr.filter((v) => v !== item.name), item.id]);
      }
    } else {
      onChange(item.id);
    }
  };

  return (
    <div className={`grid ${columnsClassName} ${className}`.trim()}>
      {categories.map((cat) => {
        const item: CategoryItem =
          typeof cat === "string"
            ? { id: cat, name: cat }
            : cat;

        const selected = isSelected(item);
        const Icon = item.icon || getCategoryIcon(item.name);

        if (layout === "compact") {
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={selected}
              onClick={() => handleSelect(item)}
              className={`flex min-h-20 min-w-0 flex-col items-center justify-center gap-2 rounded-md border px-2 py-3 text-center transition-[border-color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 cursor-pointer ${selected
                  ? "border-blue-500 bg-blue-50 text-blue-700 shadow-[0_0_0_1px_#3b82f6]"
                  : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50"
                }`}
            >
              <Icon
                size={17}
                className="shrink-0"
                aria-hidden={true}
              />
              <span className="w-full break-words text-[11px] font-medium leading-4">
                {item.name}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected}
            onClick={() => handleSelect(item)}
            className={`flex items-center gap-2.5 rounded-lg border p-3 text-left transition-all cursor-pointer ${selected
                ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-sm ring-1 ring-blue-600"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
          >
            <div
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${selected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
            >
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-xs font-semibold">
                {item.name}
              </span>
              {item.description && (
                <span className="block truncate text-[10px] text-slate-500">
                  {item.description}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default CategoryGridSelector;

import {
  Droplets,
  Leaf,
  Sprout,
  Trash2,
} from "lucide-react";

import { PROVIDER_CATEGORIES } from "../constants/providerCategories";

interface CategorySelectorProps {
  value: string[];
  onChange: (categories: string[]) => void;
}

function getCategoryIcon(category: string) {
  const normalizedCategory = category.toLowerCase();

  if (
    normalizedCategory.includes("water") ||
    normalizedCategory.includes("drain")
  ) {
    return Droplets;
  }

  if (
    normalizedCategory.includes("garbage") ||
    normalizedCategory.includes("clean") ||
    normalizedCategory.includes("waste")
  ) {
    return Trash2;
  }

  if (
    normalizedCategory.includes("grass") ||
    normalizedCategory.includes("beauty") ||
    normalizedCategory.includes("tree")
  ) {
    return Leaf;
  }

  return Sprout;
}

function CategorySelector({
  value,
  onChange,
}: CategorySelectorProps) {
  const toggleCategory = (category: string) => {
    if (value.includes(category)) {
      onChange(
        value.filter((item) => item !== category),
      );

      return;
    }

    onChange([...value, category]);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {PROVIDER_CATEGORIES.map((category) => {
        const selected = value.includes(category);
        const Icon = getCategoryIcon(category);

        return (
          <button
            key={category}
            type="button"
            aria-pressed={selected}
            onClick={() => toggleCategory(category)}
            className={`flex min-h-20 min-w-0 flex-col items-center justify-center gap-2 rounded-md border px-2 py-3 text-center transition-[border-color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
              selected
                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-[0_0_0_1px_#3b82f6]"
                : "border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50"
            }`}
          >
            <Icon
              size={17}
              strokeWidth={1.8}
              className="shrink-0"
              aria-hidden="true"
            />

            <span className="w-full break-words text-[11px] font-medium leading-4">
              {category}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default CategorySelector;

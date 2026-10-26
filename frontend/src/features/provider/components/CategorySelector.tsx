import { IssueCategorySelector } from "../../issues/components/IssueCategorySelector";

interface CategorySelectorProps {
  value: string[];
  onChange: (categories: string[]) => void;
  error?: string;
}

export function CategorySelector({
  value,
  onChange,
  error,
}: CategorySelectorProps) {
  return (
    <IssueCategorySelector
      value={value}
      onChange={onChange}
      mode="multiple"
      showHeader={false}
      columnsClassName="grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
      error={error}
    />
  );
}

export default CategorySelector;

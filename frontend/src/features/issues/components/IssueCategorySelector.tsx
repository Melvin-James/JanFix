import { useEffect, useState } from "react";
import { LoaderCircle, AlertCircle } from "lucide-react";
import type { Category } from "../../admin/types/Category";
import { getActiveIssueCategories } from "../services/issueService";
import { CategoryGridSelector } from "../../../components/UI/CategoryGridSelector";
import FormError from "../../../components/UI/FormError";

interface BaseIssueCategorySelectorProps {
  categories?: (Category | string)[];
  error?: string;
  label?: string;
  showHeader?: boolean;
  columnsClassName?: string;
}

export type IssueCategorySelectorProps =
  | (BaseIssueCategorySelectorProps & {
      mode?: "single";
      value: string;
      onChange: (categoryId: string) => void;
    })
  | (BaseIssueCategorySelectorProps & {
      mode: "multiple";
      value: string[];
      onChange: (categoryIds: string[]) => void;
    });

export function IssueCategorySelector(props: IssueCategorySelectorProps) {
  const {
    categories: propCategories,
    error,
    label = "Category",
    showHeader = true,
    columnsClassName = "grid-cols-2 gap-2.5 sm:grid-cols-3",
  } = props;
  const [categories, setCategories] = useState<(Category | string)[]>(
    propCategories ?? []
  );
  const [loading, setLoading] = useState(!propCategories);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (propCategories) {
      setCategories(propCategories);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const fetchCats = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        const data = await getActiveIssueCategories();
        if (!cancelled) {
          setCategories(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          console.error("Failed to load categories:", err);
          setFetchError("Unable to load categories. Please refresh or try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCats();
    return () => {
      cancelled = true;
    };
  }, [propCategories]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        <LoaderCircle size={16} className="animate-spin text-blue-600" />
        <span>Loading categories...</span>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-600">
        <AlertCircle size={16} />
        <span>{fetchError}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showHeader && (
        <label className="block text-sm font-semibold text-slate-900">
          {label} <span className="text-red-500">*</span>
        </label>
      )}

      {categories.length === 0 ? (
        <p className="text-xs text-slate-500">No active categories found.</p>
      ) : props.mode === "multiple" ? (
        <CategoryGridSelector
          categories={categories}
          value={props.value}
          onChange={props.onChange}
          mode="multiple"
          layout="card"
          columnsClassName={columnsClassName}
        />
      ) : (
        <CategoryGridSelector
          categories={categories}
          value={props.value}
          onChange={props.onChange}
          mode="single"
          layout="card"
          columnsClassName={columnsClassName}
        />
      )}

      {error && <FormError message={error} />}
    </div>
  );
}

export default IssueCategorySelector;

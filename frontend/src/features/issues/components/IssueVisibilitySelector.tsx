import { Globe, Lock } from "lucide-react";
import type { IssueVisibility } from "../types/issue";
import FormError from "../../../components/UI/FormError";

interface IssueVisibilitySelectorProps {
  value: IssueVisibility | null;
  onChange: (visibility: IssueVisibility) => void;
  error?: string;
}

export function IssueVisibilitySelector({
  value,
  onChange,
  error,
}: IssueVisibilitySelectorProps) {
  const options: {
    value: IssueVisibility;
    title: string;
    badge: string;
    description: string;
    Icon: typeof Globe;
  }[] = [
    {
      value: "PUBLIC",
      title: "Public Issue",
      badge: "Community",
      description:
        "Visible on the platform and community feed once verified by administrators.",
      Icon: Globe,
    },
    {
      value: "PRIVATE",
      title: "Private Issue",
      badge: "Restricted",
      description:
        "Only accessible to you and authorized platform administrators.",
      Icon: Lock,
    },
  ];

  return (
    <fieldset className="space-y-2">
      <legend className="block text-sm font-semibold text-slate-900">
        Issue Visibility <span className="text-red-500">*</span>
      </legend>

      <div className="grid gap-3 sm:grid-cols-2">
        {options.map(({ value: optionValue, title, badge, description, Icon }) => {
          const selected = value === optionValue;

          return (
            <label
              key={optionValue}
              className={`relative flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition-all ${
                selected
                  ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <input
                type="radio"
                name="issueVisibility"
                value={optionValue}
                checked={selected}
                onChange={() => onChange(optionValue)}
                aria-invalid={Boolean(error)}
                className="mt-1 accent-blue-600"
              />

              <div
                className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md ${
                  selected
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon size={18} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-900">
                    {title}
                  </span>

                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      optionValue === "PUBLIC"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {badge}
                  </span>
                </div>

                <p className="mt-0.5 text-xs text-slate-600">
                  {description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {error && (
        <FormError message={error} />
      )}
    </fieldset>
  );
}
import {

  PROVIDER_CATEGORIES,

} from "../constants/providerCategories";


interface CategorySelectorProps {

  value: string[];

  onChange: (
    categories: string[]
  ) => void;
}

function CategorySelector({

  value,

  onChange,

}: CategorySelectorProps) {

  const toggleCategory = (

    category: string

  ) => {

    if (
      value.includes(category)
    ) {

      onChange(

        value.filter(
          item =>
            item !== category
        )
      );

      return;
    }

    onChange([
      ...value,
      category,
    ]);
  };

  return (

    <div className="flex flex-wrap gap-3">

      {PROVIDER_CATEGORIES.map(

        category => {

          const selected =

            value.includes(
              category
            );

          return (

            <button

              key={category}

              type="button"

              onClick={() =>
                toggleCategory(
                  category
                )
              }

              className={`
                rounded-full
                border
                px-4
                py-2
                text-sm
                transition-all

                ${
                  selected
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-slate-300 bg-white text-slate-700"
                }
              `}
            >

              {category}

            </button>
          );
        }
      )}

    </div>
  );
}

export default CategorySelector;
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CircleHelp,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import ProviderOnboardingLayout from "../components/ProviderOnboardingLayout";
import FormError from "../../../components/UI/FormError";
import { ProviderType } from "../types/providerTypes";
import {
  providerStep1Schema,
  type ProviderStep1FormData,
} from "../validations/providerStep1Schema";
import { useProviderOnboardingStore } from "../store/providerOnboardingStore";

const providerOptions = [
  {
    value: ProviderType.INDIVIDUAL,
    title: "Individual Service Provider",
    description:
      "Independent individuals helping with local civic activities, cleanup, and public space upkeep.",
    Icon: UserRound,
    iconStyle: "bg-blue-100 text-blue-600",
  },
  {
    value: ProviderType.NGO,
    title: "NGO / Community Organization",
    description:
      "Organizations working on social impact, environmental, and community improvement initiatives.",
    Icon: Users,
    iconStyle: "bg-green-100 text-green-600",
  },
  {
    value: ProviderType.VOLUNTEER_GROUP,
    title: "Volunteer Group",
    description:
      "Local volunteer teams participating in cleanup drives and community civic activities.",
    Icon: Building2,
    iconStyle: "bg-orange-100 text-orange-700",
  },
];

const informationItems = [
  {
    title: "Community Focus",
    description: "JanFix supports collaborative civic improvement initiatives.",
    Icon: Users,
    iconStyle: "text-blue-600",
  },
  {
    title: "Verification",
    description: "Basic verification helps maintain a safe and trusted platform.",
    Icon: ShieldCheck,
    iconStyle: "text-green-600",
  },
  {
    title: "Need Help?",
    description: "Contact support if you need assistance during onboarding.",
    Icon: CircleHelp,
    iconStyle: "text-orange-700",
  },
];

function ProviderStep1Page() {
  const navigate = useNavigate();

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderStep1FormData>({
    resolver: zodResolver(providerStep1Schema),
    defaultValues: {
      providerType: undefined,
    },
  });

  const selectedProviderType = watch("providerType");
  const updateDraft = useProviderOnboardingStore(
    (state) => state.updateDraft,
  );

  const onSubmit = async (data: ProviderStep1FormData) => {
    updateDraft({
      providerType: data.providerType,
    });

    navigate("/provider/onboarding/step-2");
  };

  return (
    <ProviderOnboardingLayout currentStep={1}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-4xl"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            How Would You Like to Participate?
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Choose how you would like to contribute to community civic
            activities through JanFix.
          </p>
        </div>

        <fieldset className="mt-8">
          <legend className="sr-only">Select a provider type</legend>

          <div className="grid gap-4 md:grid-cols-3">
            {providerOptions.map(
              ({ value, title, description, Icon, iconStyle }) => {
                const isSelected = selectedProviderType === value;

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() =>
                      setValue("providerType", value, {
                        shouldValidate: true,
                      })
                    }
                    className={`flex min-h-60 w-full flex-col items-center rounded-lg border bg-white px-5 py-6 text-center transition-[border-color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 md:min-h-64 ${
                      isSelected
                        ? "border-blue-500 shadow-[0_0_0_1px_#3b82f6]"
                        : "border-slate-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    <span
                      className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${iconStyle}`}
                    >
                      <Icon size={25} strokeWidth={1.8} aria-hidden="true" />
                    </span>

                    <span className="mt-5 text-sm font-bold leading-5 text-slate-900">
                      {title}
                    </span>
                    <span className="mt-3 text-sm leading-5 text-slate-600">
                      {description}
                    </span>
                  </button>
                );
              },
            )}
          </div>

          <div className="min-h-7 pt-2 text-center" aria-live="polite">
            <FormError message={errors.providerType?.message} />
          </div>
        </fieldset>

        <section
          aria-label="Provider onboarding information"
          className="mt-5 grid gap-3 md:grid-cols-3"
        >
          {informationItems.map(
            ({ title, description, Icon, iconStyle }) => (
              <div
                key={title}
                className="grid min-h-28 grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md bg-blue-50/80 p-4"
              >
                <Icon
                  size={18}
                  strokeWidth={1.8}
                  className={`mt-0.5 shrink-0 ${iconStyle}`}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <h2 className="text-sm font-medium text-slate-800">
                    {title}
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {description}
                  </p>
                </div>
              </div>
            ),
          )}
        </section>

        <div className="mt-7 flex items-center justify-between gap-4 border-t border-slate-300 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </button>

          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-blue-600 px-6 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Continue
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </form>
    </ProviderOnboardingLayout>
  );
}

export default ProviderStep1Page;

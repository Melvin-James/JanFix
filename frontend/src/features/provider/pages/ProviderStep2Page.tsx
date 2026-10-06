import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

import ProviderOnboardingLayout from "../components/ProviderOnboardingLayout";
import CommonProviderFields from "../components/CommonProviderFields";
import VolunteerGroupFields from "../components/VolunteerGroupFields";
import OrganizationFields from "../components/OrganizationFields";
import CategorySelector from "../components/CategorySelector";
import WebsiteLinksField from "../components/WebsiteLinksField";
import FormError from "../../../components/UI/FormError";

import {
  providerStep2Schema,
  type ProviderStep2FormData,
} from "../validations/providerStep2Schema";

import { ProviderType } from "../types/providerTypes";
import { useProviderOnboardingStore } from "../store/providerOnboardingStore";

function ProviderStep2Page() {
  const navigate = useNavigate();

  const draft = useProviderOnboardingStore((state) => state.draft);

  const updateDraft = useProviderOnboardingStore(
    (state) => state.updateDraft,
  );

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<ProviderStep2FormData>({
    resolver: zodResolver(providerStep2Schema),

    defaultValues: {
      ...draft,
      websiteLinks: draft.websiteLinks ?? [],
    },
  });

  const providerType = draft.providerType;

  const onSubmit = (data: ProviderStep2FormData) => {
    updateDraft({
      ...data,
    });

    navigate("/provider/onboarding/review");
  };

  const heading =
    providerType === ProviderType.VOLUNTEER_GROUP
      ? "Tell Us About Your Volunteer Group"
      : providerType === ProviderType.NGO
        ? "Tell Us About Your Organization"
        : "Complete Your Profile";

  const description =
    providerType === ProviderType.VOLUNTEER_GROUP
      ? "Help us understand your volunteer community and the civic activities you participate in."
      : providerType === ProviderType.NGO
        ? "Help us understand your organization and the community initiatives you focus on."
        : "Help us build a trusted civic community by sharing a few details about yourself.";

  const securityMessage =
    providerType === ProviderType.VOLUNTEER_GROUP
      ? "JanFix supports collaborative community participation and civic improvement initiatives."
      : providerType === ProviderType.NGO
        ? "Your information helps us maintain a trusted and collaborative community platform."
        : "Your information is securely stored and only used to maintain a safe and trusted community platform.";

  return (
    <ProviderOnboardingLayout currentStep={2}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto w-full max-w-3xl"
      >
        <header className="mb-7">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            {heading}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </header>

        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <CommonProviderFields
              register={register}
              control={control}
              errors={errors}
            />
          </section>

          {providerType === ProviderType.VOLUNTEER_GROUP && (
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <VolunteerGroupFields
                register={register}
                control={control}
                errors={errors}
              />
            </section>
          )}

          {providerType === ProviderType.NGO && (
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <OrganizationFields
                register={register}
                control={control}
                errors={errors}
              />
            </section>
          )}

          <section aria-labelledby="provider-categories">
            <h2
              id="provider-categories"
              className="mb-3 text-xs font-semibold text-slate-700"
            >
              How would you like to help?
            </h2>

            <Controller
              name="categoriesWillingToWork"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <CategorySelector
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <div className="min-h-7" aria-live="polite">
              <FormError
                message={
                  errors.categoriesWillingToWork?.message as string
                }
              />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <WebsiteLinksField
              control={control}
              register={register}
              setValue={setValue}
              errors={errors}
            />
          </section>

          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md bg-blue-50 px-4 py-3 text-blue-700">
            <ShieldCheck
              size={18}
              strokeWidth={1.8}
              className="mt-0.5 shrink-0"
              aria-hidden="true"
            />

            <p className="text-xs leading-5">{securityMessage}</p>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
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

export default ProviderStep2Page;

import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";

import { Building2 } from "lucide-react";

import FileUploadField from "./FileUploadField";

import FormField from "../../../components/UI/FormField";

import type { ProviderStep2FormData } from "../validations/providerStep2Schema";

interface OrganizationFieldsProps {
  register: UseFormRegister<ProviderStep2FormData>;
  control: Control<ProviderStep2FormData>;
  errors: FieldErrors<ProviderStep2FormData>;
}

function OrganizationFields({
  register,
  control,
  errors,
}: OrganizationFieldsProps) {
  return (
    <div>
      <div className="flex items-center gap-2 text-slate-900">
        <Building2
          size={18}
          className="shrink-0 text-blue-600"
          aria-hidden="true"
        />

        <h2 className="text-base font-semibold">
          Organization Verification
        </h2>
      </div>

      <div className="mt-5">
        <FormField
          label="Member Count"
          type="number"
          min={1}
          error={
            errors.organizationProfile?.memberCount
              ?.message as string
          }
          {...register("organizationProfile.memberCount", {
            valueAsNumber: true,
          })}
        />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Controller
          name="organizationProfile.logo"
          control={control}
          render={({ field }) => (
            <FileUploadField
              label="Organization Logo"
              folder="provider/logos"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <div>

          <Controller
            name="organizationProfile.ngoRegistrationDocument"
            control={control}
            render={({ field }) => (
              <FileUploadField
                label="NGO Registration Document"
                folder="provider/ngo-documents"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}

export default OrganizationFields;

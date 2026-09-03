import type { FieldErrors, UseFormRegister, Control } from "react-hook-form";

import { Controller } from "react-hook-form";

import FileUploadField from "./FileUploadField";

import FormField from "../../../components/UI/FormField";

import type { ProviderStep2FormData } from "../validations/providerStep2Schema";

interface OrganizationFieldsProps {

  register:
    UseFormRegister<ProviderStep2FormData>;

  control:
    Control<ProviderStep2FormData>

  errors:
    FieldErrors<ProviderStep2FormData>;
}

function OrganizationFields({

  register,

  control,

  errors,

}: OrganizationFieldsProps) {

  return (

    <div className="space-y-4">

      <h2 className="text-lg font-semibold">

        Organization Details

      </h2>

      <FormField

        label="Member Count"

        type="number"

        error={
          errors
            .organizationProfile
            ?.memberCount
            ?.message as string
        }

        {...register(
          "organizationProfile.memberCount",
          {
            valueAsNumber: true,
          }
        )}

      />

      <Controller
        name="organizationProfile.ngoRegistrationDocument"
        control={control}
        render={({field}) => (
          <FileUploadField
            label="NGO Registration Document"
            folder="provider/ngo-documents"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        name="organizationProfile.logo"
        control={control}
        render={({field}) => (
          <FileUploadField
            label="NGO Logo"
            folder="provider/logos"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

    </div>
  );
}

export default OrganizationFields;
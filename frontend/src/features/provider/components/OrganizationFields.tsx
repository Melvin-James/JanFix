import type { FieldErrors, UseFormRegister } from "react-hook-form";

import FormField from "../../../components/UI/FormField";

import type { ProviderStep2FormData } from "../validations/providerStep2Schema";

interface OrganizationFieldsProps {

  register:
    UseFormRegister<ProviderStep2FormData>;

  errors:
    FieldErrors<ProviderStep2FormData>;
}

function OrganizationFields({

  register,

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

    </div>
  );
}

export default OrganizationFields;
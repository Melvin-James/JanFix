import type { FieldErrors, UseFormRegister, } from "react-hook-form";

import FormField from "../../../components/UI/FormField";

import type { ProviderStep2FormData, } from "../validations/providerStep2Schema";

interface VolunteerGroupFieldsProps {

    register:
    UseFormRegister<ProviderStep2FormData>;

    errors:
    FieldErrors<ProviderStep2FormData>;
}

function VolunteerGroupFields({

  register,

  errors,

}: VolunteerGroupFieldsProps) {

  return (

    <div className="space-y-4">

      <h2 className="text-lg font-semibold">

        Volunteer Group Details

      </h2>

      <FormField

        label="Member Count"

        type="number"

        error={
          errors
            .volunteerGroupProfile
            ?.memberCount
            ?.message as string
        }

        {...register(
          "volunteerGroupProfile.memberCount",
          {
            valueAsNumber: true,
          }
        )}

      />

    </div>
  );
}

export default VolunteerGroupFields;
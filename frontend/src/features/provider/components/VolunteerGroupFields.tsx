import { type FieldErrors, type UseFormRegister, type Control, Controller } from "react-hook-form";

import FileUploadField from "./FileUploadField";

import FormField from "../../../components/UI/FormField";

import type { ProviderStep2FormData, } from "../validations/providerStep2Schema";

interface VolunteerGroupFieldsProps {

    register:
    UseFormRegister<ProviderStep2FormData>;

    control:
    Control<ProviderStep2FormData>;

    errors:
    FieldErrors<ProviderStep2FormData>;
}

function VolunteerGroupFields({

  register,

  control,

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

      <Controller
        name="volunteerGroupProfile.logo"
        control={control}
        render={({field}) =>(
          <FileUploadField
            label="Group Logo"
            folder="provider/logos"
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

    </div>
  );
}

export default VolunteerGroupFields;
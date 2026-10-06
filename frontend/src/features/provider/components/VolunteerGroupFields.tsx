import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";

import { Users } from "lucide-react";

import FileUploadField from "./FileUploadField";
import FormField from "../../../components/UI/FormField";

import type { ProviderStep2FormData } from "../validations/providerStep2Schema";

interface VolunteerGroupFieldsProps {
  register: UseFormRegister<ProviderStep2FormData>;
  control: Control<ProviderStep2FormData>;
  errors: FieldErrors<ProviderStep2FormData>;
}

function VolunteerGroupFields({
  register,
  control,
  errors,
}: VolunteerGroupFieldsProps) {
  return (
    <div>
      <div className="flex items-center gap-2 text-slate-900">
        <Users
          size={18}
          className="shrink-0 text-blue-600"
          aria-hidden="true"
        />

        <h2 className="text-base font-semibold">
          Group Information
        </h2>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <FormField
          label="Approximate Number of Volunteers"
          type="number"
          min={1}
          error={
            errors.volunteerGroupProfile?.memberCount
              ?.message as string
          }
          {...register(
            "volunteerGroupProfile.memberCount",
            {
              valueAsNumber: true,
            },
          )}
        />

        <div>
          <Controller
            name="volunteerGroupProfile.logo"
            control={control}
            render={({ field }) => (
              <FileUploadField
                label="Group Logo"
                folder="provider/logos"
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

export default VolunteerGroupFields;

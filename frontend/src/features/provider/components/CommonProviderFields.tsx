import type { FieldErrors, UseFormRegister, } from "react-hook-form";

import FormField from "../../../components/UI/FormField";

import type { ProviderStep2FormData, } from "../validations/providerStep2Schema";

interface CommonProviderFieldsProps {

    register: UseFormRegister<ProviderStep2FormData>;

    errors: FieldErrors<ProviderStep2FormData>;
}

function CommonProviderFields({ register, errors }: CommonProviderFieldsProps) {
    return (
        <div className="space-y-4">
            <FormField
                label="Provider Name"
                error={errors.providerName?.message as string}
                {...register("providerName")}
            />
            
            <FormField
                label="Responsible Person Name"
                error={errors.responsiblePersonName?.message as string}
                {...register("responsiblePersonName")}
            />

            <FormField
                label="Address"
                error={errors.address?.message as string}
                {...register("address")}
            />

            <FormField
                label="Phone Number"
                error={errors.phone?.message as string}
                {...register("phone")}
            />

            <FormField
                label="Government ID"
                error={errors.governmentId?.message as string}
                {...register("governmentId")}
            />
        </div>
    )
}

export default CommonProviderFields
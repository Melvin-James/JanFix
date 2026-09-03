import type { FieldErrors, UseFormRegister, Control } from "react-hook-form";

import FormField from "../../../components/UI/FormField";

import type { ProviderStep2FormData, } from "../validations/providerStep2Schema";

import FileUploadField from "./FileUploadField";

import { Controller } from "react-hook-form";

import FormError from "../../../components/UI/FormError";

import CommunityPhotosField from "./CommunityPhotosField";


interface CommonProviderFieldsProps {

    register: UseFormRegister<ProviderStep2FormData>;

    control: Control<ProviderStep2FormData>;

    errors: FieldErrors<ProviderStep2FormData>;
}

function CommonProviderFields({ register, control, errors }: CommonProviderFieldsProps) {
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

            <Controller
                name="identityProof"
                control={control}
                render={({field})=>(
                    <FileUploadField
                        label='Identity Proof'
                        folder='provider/identity-proofs'
                        value={field.value}
                        onChange={field.onChange}
                    />
                )}
            />

            <FormError
                message={
                    errors.identityProof?.message as string
                }
            />

            <Controller
                name="profileImage"
                control={control}
                render={({field}) => (
                    <FileUploadField
                        label="Profile Image"
                        folder="provider/profile-images"
                        value={field.value}
                        onChange={field.onChange}
                    />
                )}
            />

            <Controller
                name="previousCommunityPhotos"
                control={control}
                render={({field}) => (
                    <CommunityPhotosField
                        value={field.value}
                        onChange={field.onChange}
                    />
                )}
            />
            
        </div>
    )
}

export default CommonProviderFields
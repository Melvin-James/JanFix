import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import ProviderOnboardingLayout from "../components/ProviderOnboardingLayout";

import CommonProviderFields from "../components/CommonProviderFields";

import { providerStep2Schema, type ProviderStep2FormData } from "../validations/providerStep2Schema";

import { Controller } from "react-hook-form";

import CategorySelector from "../components/CategorySelector";

import FormError from "../../../components/UI/FormError";

import { useState, useEffect, } from "react";

import { useNavigate } from "react-router-dom";

import { getProviderProfile } from "../services/providerService";

import VolunteerGroupFields from "../components/VolunteerGroupFields";

import OrganizationFields from "../components/OrganizationFields";

import { ProviderType } from "../types/providerTypes";

import LoadingSpinner from "../../../components/LoadingSpinner";

import { completeProviderStep2 } from "../services/providerService";

function ProviderStep2Page() {

    const { register, control, handleSubmit, formState: { errors } } = useForm<ProviderStep2FormData>({

        resolver: zodResolver(providerStep2Schema),
    });

    const [providerType, setProviderType] = useState<ProviderType | null>(null);


    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {

        const fetchProvider = async () => {

            try {

                const response = await getProviderProfile();

                setProviderType(response.provider.providerType);

            } catch (error) {

                console.error(error);
            }
        };

        fetchProvider();

    }, []);

    const onSubmit = async (
        data: ProviderStep2FormData
    ) => {

        try {

            setLoading(true);

            await completeProviderStep2(data);

            navigate(
                "/provider/onboarding/review"
            );

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };
    if (!providerType) {

        return (

            <ProviderOnboardingLayout
                currentStep={2}
            >

                <LoadingSpinner />

            </ProviderOnboardingLayout>
        );
    }
    return (
        <ProviderOnboardingLayout currentStep={2}>

            <form
                onSubmit={
                    handleSubmit(onSubmit)
                }
                className="max-w-3xl"
            >

                <h1 className="text-3xl font-bold text-slate-900">

                    Profile Setup

                </h1>

                <p className="mt-2 text-slate-500">

                    Provide your details and
                    supporting documents.

                </p>

                <div className="mt-8">

                    <CommonProviderFields

                        register={register}

                        errors={errors}

                    />

                </div>

                {
                    providerType ===
                    ProviderType.VOLUNTEER_GROUP && (

                        <div className="mt-8">

                            <VolunteerGroupFields

                                register={register}

                                errors={errors}

                            />

                        </div>
                    )
                }

                {
                    providerType ===
                    ProviderType.NGO && (

                        <div className="mt-8">

                            <OrganizationFields

                                register={register}

                                errors={errors}

                            />

                        </div>
                    )
                }

                <div className="mt-6">

                    <label
                        className="
                            block
                            text-sm
                            font-medium
                            text-slate-700
                            mb-3
                            "
                    >

                        Categories Willing To Work

                    </label>

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

                    <FormError

                        message={
                            errors
                                .categoriesWillingToWork
                                ?.message as string
                        }

                    />

                </div>

                <button

                    type="submit"

                    disabled={loading}

                    className="..."

                >

                    {

                        loading

                            ? "Saving..."

                            : "Continue"

                    }

                </button>

            </form>

        </ProviderOnboardingLayout>
    )
}

export default ProviderStep2Page;
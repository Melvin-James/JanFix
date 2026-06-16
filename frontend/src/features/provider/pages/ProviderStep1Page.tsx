import { useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Building2, Users, User } from "lucide-react";

import ProviderOnboardingLayout from "../components/ProviderOnboardingLayout";

import ProviderTypeCard from "../components/ProviderTypeCard";

import FormError from "../../../components/UI/FormError";

import { ProviderType } from "../types/providerTypes";

import { providerStep1Schema, type ProviderStep1FormData } from "../validations/providerStep1Schema";

import { completeProviderStep1 } from "../services/providerService";

import { useState } from "react";

function ProviderStep1Page() {

    const navigate = useNavigate();

    const {

        watch,

        setValue,

        handleSubmit,

        formState: { errors }

    } = useForm<ProviderStep1FormData>({

        resolver:
            zodResolver(
                providerStep1Schema
            ),

        defaultValues: {

            providerType:
                ProviderType.INDIVIDUAL,
        },
    });

    const [loading, setLoading] = useState(false);

    const selectedProviderType = watch("providerType");


    const onSubmit = async (
        data: ProviderStep1FormData
    ) => {

        try {

            setLoading(true);

            await completeProviderStep1(
                data.providerType
            );

            navigate(
                "/provider/onboarding/step-2"
            );

        } finally {

            setLoading(false);
        }
    };

    return (

        <ProviderOnboardingLayout
            currentStep={1}
        >

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="max-w-3xl"
            >

                <div className="max-w-3xl">

                    <h1 className="text-3xl font-bold text-slate-900">

                        Become a Service Provider

                    </h1>

                    <p className="mt-2 text-slate-500">

                        Choose how you'd like to contribute
                        to your community through JanFix.

                    </p>

                </div>

                <div className="mt-8 space-y-4">

                    <ProviderTypeCard

                        title="Individual"

                        description="
                            Work independently on civic issues
                            and community projects.
                            "

                        icon={<User size={24} />}

                        selected={
                            selectedProviderType ===
                            ProviderType.INDIVIDUAL
                        }

                        onClick={() =>
                            setValue(
                                "providerType",
                                ProviderType.INDIVIDUAL,
                                {
                                    shouldValidate: true,
                                }
                            )
                        }
                    />

                    <ProviderTypeCard

                        title="Volunteer Group"

                        description="
                            Represent a community group
                            working together on local issues.
                            "

                        icon={<Users size={24} />}

                        selected={
                            selectedProviderType ===
                            ProviderType.VOLUNTEER_GROUP
                        }

                        onClick={() =>
                            setValue(
                                "providerType",
                                ProviderType.VOLUNTEER_GROUP,
                                {
                                    shouldValidate: true,
                                }
                            )
                        }
                    />

                    <ProviderTypeCard

                        title="NGO"

                        description="
                        Register as an organization
                        managing structured community
                        initiatives."

                        icon={<Building2 size={24} />}

                        selected={
                            selectedProviderType ===
                            ProviderType.NGO
                        }

                        onClick={() =>
                            setValue(
                                "providerType",
                                ProviderType.NGO,
                                {
                                    shouldValidate: true,
                                }
                            )
                        }
                    />

                    <FormError

                        message={
                            errors.providerType?.message
                        }
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            mt-6
                            rounded-lg
                            bg-blue-600
                            px-6
                            py-3
                            text-white
                            font-medium
                            hover:bg-blue-700
                            disabled:opacity-60
                        "
                    >

                        {loading
                            ? "Please wait..."
                            : "Continue"}

                    </button>

                </div>

            </form>

        </ProviderOnboardingLayout>
    );
}

export default ProviderStep1Page;
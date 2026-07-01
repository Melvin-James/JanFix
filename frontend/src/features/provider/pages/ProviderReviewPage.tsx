import { useEffect, useState } from "react";

import ProviderOnboardingLayout from "../components/ProviderOnboardingLayout";

import { getProviderProfile } from "../services/providerService";

import LoadingSpinner from "../../../components/LoadingSpinner";

import type { ProviderProfile } from "../types/providerProfile";

import ProviderInfoRow from "../components/ProviderInfoRow";

import { useNavigate } from "react-router-dom";

import { submitProviderApplication } from "../services/providerService";

function ProviderReviewPage() {

    const [provider, setProvider] = useState<ProviderProfile | null>(null);

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const fetchProvider = async () => {

            const response = await getProviderProfile();

            setProvider(response.provider);
        };

        fetchProvider();

    }, []);

    const handleSubmitApplication =

        async () => {

            try {

                setLoading(true);

                await submitProviderApplication();

                navigate(
                    "/provider/welcome"
                );

            } finally {

                setLoading(false);
            }
        };

    if (!provider) {

        return (

            <ProviderOnboardingLayout
                currentStep={3}
            >

                <LoadingSpinner />

            </ProviderOnboardingLayout>
        );
    }

    return (

        <ProviderOnboardingLayout
            currentStep={3}
        >

            <h1 className="text-3xl font-bold">

                Review & Submit

            </h1>

            <p className="mt-2 text-slate-500">

                Please verify your
                information before
                submitting.

            </p>

            <ProviderInfoRow
                label="Provider Type"
                value={provider.providerType}
            />

            <ProviderInfoRow
                label="Provider Name"
                value={provider.providerName}
            />

            <ProviderInfoRow
                label="Responsible Person"
                value={provider.responsiblePersonName}
            />

            <ProviderInfoRow
                label="Address"
                value={provider.address}
            />

            <ProviderInfoRow
                label="Phone"
                value={provider.phone}
            />

            <ProviderInfoRow
                label="Government ID"
                value={provider.governmentId}
            />

            <ProviderInfoRow
                label="Categories"
                value={
                    provider.categoriesWillingToWork?.join(", ")
                }
            />

            {
                provider.volunteerGroupProfile && (
                    <>
                        <h2 className="mt-8 mb-4 text-lg font-semibold">

                            Volunteer Group Details

                        </h2>

                        <ProviderInfoRow
                            label="Member Count"
                            value={
                                provider
                                    .volunteerGroupProfile
                                    .memberCount
                            }
                        />
                    </>
                )
            }

            {
                provider.organizationProfile && (

                    <>

                        <h2 className="mt-8 mb-4 text-lg font-semibold">

                            Organization Details

                        </h2>

                        <ProviderInfoRow
                            label="Member Count"
                            value={
                                provider
                                    .organizationProfile
                                    .memberCount
                            }
                        />

                        <ProviderInfoRow
                            label="NGO Registration"
                            value={
                                provider
                                    .organizationProfile
                                    .ngoRegistrationDocument
                            }
                        />
                    </>
                )
            }

            <div className="mt-10 flex gap-4">


                <button
                    type="button"
                    onClick={handleSubmitApplication}
                    disabled={loading}
                    className="
      rounded-lg
      bg-blue-600
      px-6
      py-3
      text-white
    "
                >

                    {
                        loading
                            ? "Submitting..."
                            : "Submit Application"
                    }

                </button>

            </div>

        </ProviderOnboardingLayout>
    );
}

export default ProviderReviewPage;
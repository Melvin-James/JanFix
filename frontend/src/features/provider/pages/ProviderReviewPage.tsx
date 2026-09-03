import { useState } from "react";

import { useNavigate } from "react-router-dom";

import ProviderOnboardingLayout from "../components/ProviderOnboardingLayout";

import { submitProviderApplication } from "../services/providerService";

import { useProviderOnboardingStore } from "../store/providerOnboardingStore";

import { useAuthStore } from "../../../store/authStore";

import UploadedFileView from "../components/UploadedFileView";



function ProviderReviewPage() {


    const navigate = useNavigate();


    const [loading, setLoading] =
        useState(false);



    const draft =
        useProviderOnboardingStore(
            state => state.draft
        );


    const clearDraft =
        useProviderOnboardingStore(
            state => state.clearDraft
        );

    const setAuth = useAuthStore(
        state => state.setAuth
    );

    const accessToken = useAuthStore(
        state => state.accessToken
    )



    const handleSubmitApplication =
        async () => {


            try {


                setLoading(true);



                const response = await submitProviderApplication(
                    draft
                );

                setAuth(
                    accessToken!,
                    response.data.user
                )

                clearDraft();



                navigate(
                    "/provider/application-submitted"
                );



            } catch (error) {


                console.error(error);


            } finally {


                setLoading(false);

            }

        };




    return (


        <ProviderOnboardingLayout
            currentStep={3}
        >

            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">

                <h2 className="text-xl font-semibold text-slate-900">
                    Provider Information
                </h2>

                <dl className="mt-4 grid gap-y-3 text-sm sm:grid-cols-[180px_1fr] sm:gap-x-6">

                    <dt className="font-medium text-slate-900">
                        Provider Type
                    </dt>

                    <dd className="text-slate-600">
                        {draft.providerType}
                    </dd>


                    <dt className="font-medium text-slate-900">
                        Provider Name
                    </dt>

                    <dd className="text-slate-600">
                        {draft.providerName}
                    </dd>


                    <dt className="font-medium text-slate-900">
                        Responsible Person
                    </dt>

                    <dd className="text-slate-600">
                        {draft.responsiblePersonName}
                    </dd>


                    <dt className="font-medium text-slate-900">
                        Address
                    </dt>

                    <dd className="text-slate-600">
                        {draft.address}
                    </dd>


                    <dt className="font-medium text-slate-900">
                        Phone
                    </dt>

                    <dd className="text-slate-600">
                        {draft.phone}
                    </dd>

                </dl>

            </div>





            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">

                <h2 className="text-xl font-semibold text-slate-900">
                    Documents & Photos
                </h2>

                <dl className="mt-4 grid gap-y-3 text-sm sm:grid-cols-[180px_1fr] sm:gap-x-6">

                    <dt className="font-medium text-slate-900">
                        Identity Proof
                    </dt>

                    <dd>
                        <UploadedFileView
                            file={draft.identityProof}
                        />
                    </dd>


                    <dt className="font-medium text-slate-900">
                        Profile Image
                    </dt>

                    <dd>
                        <UploadedFileView
                            file={draft.profileImage}
                        />
                    </dd>


                    <dt className="font-medium text-slate-900">
                        Community Photos
                    </dt>

                    <dd>
                        {draft.previousCommunityPhotos?.length ? (
                            <div className="space-y-1">
                                {draft.previousCommunityPhotos.map((photo) => (
                                    <UploadedFileView
                                        key={photo.key}
                                        file={photo}
                                    />
                                ))}
                            </div>
                        ) : (
                            <span className="text-slate-400">
                                Not uploaded
                            </span>
                        )}
                    </dd>

                </dl>

            </div>


            {draft.organizationProfile && (

                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">

                    <h2 className="text-xl font-semibold text-slate-900">
                        Organization Details
                    </h2>

                    <dl className="mt-4 grid gap-y-3 text-sm sm:grid-cols-[180px_1fr] sm:gap-x-6">

                        <dt className="font-medium text-slate-900">
                            Member Count
                        </dt>

                        <dd className="text-slate-600">
                            {draft.organizationProfile.memberCount}
                        </dd>


                        <dt className="font-medium text-slate-900">
                            NGO Registration Document
                        </dt>

                        <dd>
                            <UploadedFileView
                                file={
                                    draft.organizationProfile
                                        .ngoRegistrationDocument
                                }
                            />
                        </dd>


                        <dt className="font-medium text-slate-900">
                            NGO Logo
                        </dt>

                        <dd>
                            <UploadedFileView
                                file={
                                    draft.organizationProfile.logo
                                }
                            />
                        </dd>

                    </dl>

                </div>

            )}



            {draft.volunteerGroupProfile && (

                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">

                    <h2 className="text-xl font-semibold text-slate-900">
                        Volunteer Group Details
                    </h2>

                    <dl className="mt-4 grid gap-y-3 text-sm sm:grid-cols-[180px_1fr] sm:gap-x-6">

                        <dt className="font-medium text-slate-900">
                            Member Count
                        </dt>

                        <dd className="text-slate-600">
                            {draft.volunteerGroupProfile.memberCount}
                        </dd>


                        <dt className="font-medium text-slate-900">
                            Group Logo
                        </dt>

                        <dd>
                            <UploadedFileView
                                file={
                                    draft.volunteerGroupProfile.logo
                                }
                            />
                        </dd>

                    </dl>

                </div>

            )}


            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">

                <h2 className="text-xl font-semibold text-slate-900">
                    Work Preferences
                </h2>

                <div className="mt-4">

                    <h3 className="text-sm font-medium text-slate-900">
                        Categories Willing To Work
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2">

                        {draft.categoriesWillingToWork?.map(
                            category => (

                                <span
                                    key={category}
                                    className="
                            rounded-full
                            bg-slate-100
                            px-3
                            py-1
                            text-sm
                            text-slate-700
                        "
                                >
                                    {category}
                                </span>

                            )
                        )}

                    </div>

                </div>

                <div className="mt-6">

                    <h3 className="text-sm font-medium text-slate-900">
                        Website / Social Links
                    </h3>

                    {draft.websiteLinks?.length ? (

                        <div className="mt-2 space-y-2">

                            {draft.websiteLinks.map(
                                (url, index) => (

                                    <a
                                        key={index}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="
                                block
                                text-sm
                                text-blue-600
                                hover:text-blue-700
                                hover:underline
                            "
                                    >
                                        {url}
                                    </a>

                                )
                            )}

                        </div>

                    ) : (

                        <p className="mt-2 text-sm text-slate-400">
                            No links added
                        </p>

                    )}

                </div>



            </div>




            <div className="mt-10 flex gap-4">



                <button


                    type="button"


                    onClick={
                        handleSubmitApplication
                    }


                    disabled={
                        loading
                    }


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
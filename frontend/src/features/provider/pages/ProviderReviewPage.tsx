import { useState } from "react";

import { useNavigate } from "react-router-dom";


import ProviderOnboardingLayout from "../components/ProviderOnboardingLayout";

import ProviderInfoRow from "../components/ProviderInfoRow";


import { submitProviderApplication } from "../services/providerService";

import { useProviderOnboardingStore } from "../store/providerOnboardingStore";



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



    const handleSubmitApplication =
        async () => {


            try {


                setLoading(true);



                await submitProviderApplication(
                    draft
                );



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

                value={
                    draft.providerType
                }

            />




            <ProviderInfoRow

                label="Provider Name"

                value={
                    draft.providerName
                }

            />




            <ProviderInfoRow

                label="Responsible Person"

                value={
                    draft.responsiblePersonName
                }

            />




            <ProviderInfoRow

                label="Address"

                value={
                    draft.address
                }

            />





            <ProviderInfoRow

                label="Phone"

                value={
                    draft.phone
                }

            />





            <ProviderInfoRow

                label="Identity Proof"

                value={
                    draft.identityProof
                        ?.originalName
                }

            />






            <ProviderInfoRow

                label="Categories"

                value={

                    draft
                        .categoriesWillingToWork
                        ?.join(", ")

                }

            />








            {

                draft.volunteerGroupProfile && (


                    <>


                        <h2 className="mt-8 mb-4 text-lg font-semibold">


                            Volunteer Group Details


                        </h2>




                        <ProviderInfoRow


                            label="Member Count"


                            value={

                                draft
                                    .volunteerGroupProfile
                                    .memberCount
                                    .toString()

                            }

                        />


                    </>


                )

            }









            {

                draft.organizationProfile && (


                    <>


                        <h2 className="mt-8 mb-4 text-lg font-semibold">


                            Organization Details


                        </h2>





                        <ProviderInfoRow


                            label="Member Count"


                            value={

                                draft
                                    .organizationProfile
                                    .memberCount
                                    .toString()

                            }


                        />






                        <ProviderInfoRow


                            label="NGO Registration"


                            value={

                                draft
                                    .organizationProfile
                                    .ngoRegistrationDocument
                                    ?.originalName

                            }


                        />



                    </>


                )

            }







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
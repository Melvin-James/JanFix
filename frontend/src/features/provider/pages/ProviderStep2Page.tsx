import { useForm, Controller } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useNavigate } from "react-router-dom";


import ProviderOnboardingLayout from "../components/ProviderOnboardingLayout";

import CommonProviderFields from "../components/CommonProviderFields";

import VolunteerGroupFields from "../components/VolunteerGroupFields";

import OrganizationFields from "../components/OrganizationFields";

import CategorySelector from "../components/CategorySelector";


import FormError from "../../../components/UI/FormError";


import {

    providerStep2Schema,

    type ProviderStep2FormData,

} from "../validations/providerStep2Schema";


import { ProviderType } from "../types/providerTypes";


import { useProviderOnboardingStore } from "../store/providerOnboardingStore";

function ProviderStep2Page() {


    const navigate = useNavigate();


    const draft =
        useProviderOnboardingStore(
            state => state.draft
        );


    const updateDraft =
        useProviderOnboardingStore(
            state => state.updateDraft
        );


    const {

        register,

        control,

        handleSubmit,

        formState: { errors },

    } = useForm<ProviderStep2FormData>({

        resolver:
            zodResolver(
                providerStep2Schema
            ),


        defaultValues: {

            ...draft,

        },

    });



    const providerType =
        draft.providerType;



    const onSubmit = (

        data: ProviderStep2FormData

    ) => {


        updateDraft({

            ...data,

        });


        navigate(

            "/provider/onboarding/review"

        );

    };



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

                        control={control}

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


                    className="
                    mt-8
                    rounded-lg
                    bg-blue-600
                    px-6
                    py-3
                    text-white
                    font-medium
                    hover:bg-blue-700
                    "

                >


                    Continue


                </button>



            </form>


        </ProviderOnboardingLayout>

    );

}



export default ProviderStep2Page;
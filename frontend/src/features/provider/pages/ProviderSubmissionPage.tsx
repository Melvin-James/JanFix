import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import { ArrowLeft, FileText, User, Briefcase, ClipboardCheck, Users, Building2 } from "lucide-react";

import { getProviderProfile } from "../services/providerService";

import type { ProviderProfile } from "../types/providerProfile";

import MainLayout from "../../../layouts/MainLayout";

import UploadedFileView from "../components/UploadedFileView";

function ProviderSubmissionPage() {

  const [provider, setProvider] = useState<ProviderProfile | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const fetchProviderProfile = async () => {

      try {
        const data = await getProviderProfile();

        setProvider(data.provider);

      } catch (error) {

        console.error(error);

        setError("Unable to load your application.");

      } finally {

        setLoading(false);

      }

    };

    fetchProviderProfile();

  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading your application...</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <p className="text-red-600">{error ?? "Application not found."}</p>
          <Link
            to="/home"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      {/* Header */}

      {/* Main */}
      <main className="flex flex-1 flex-col px-4 py-10 sm:py-14">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            to="/provider/application-submitted"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to welcome
          </Link>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Your Provider Application
          </h1>
          <p className="mt-2 text-base text-slate-500">
            Here are the details you submitted for review.
          </p>

          <div className="mt-8 space-y-6">
            {/* Application Status */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Application Status</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {provider.status.applicationStatus}
                  </p>
                </div>
              </div>
            </section>

            {/* Provider Information */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-slate-900">Provider Information</h2>
                  <dl className="mt-3 grid gap-y-2 text-sm text-slate-600 sm:grid-cols-[140px_1fr] sm:gap-x-4">
                    <dt className="font-medium text-slate-900">Provider Type</dt>
                    <dd>{provider.identity.providerType}</dd>

                    <dt className="font-medium text-slate-900">Provider Name</dt>
                    <dd>{provider.identity.providerName}</dd>

                    <dt className="font-medium text-slate-900">Responsible Person</dt>
                    <dd>{provider.identity.responsiblePersonName}</dd>

                    <dt className="font-medium text-slate-900">Address</dt>
                    <dd>{provider.identity.address}</dd>

                    <dt className="font-medium text-slate-900">Phone</dt>
                    <dd>{provider.identity.phone}</dd>
                  </dl>
                </div>
              </div>
            </section>

            {/* Work Preferences */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-slate-900">Work Preferences</h2>
                  <dl className="mt-3 grid gap-y-2 text-sm text-slate-600 sm:grid-cols-[140px_1fr] sm:gap-x-4">
                    <dt className="font-medium text-slate-900">Categories</dt>
                    <dd>{provider.workPreferences.categoriesWillingToWork.join(", ")}</dd>

                    <dt className="font-medium text-slate-900">
                      Website Links
                    </dt>

                    <dd>

                      {provider.workPreferences.websiteLinks?.length ? (

                        <div className="space-y-1">

                          {provider.workPreferences.websiteLinks.map(
                            (url, index) => (

                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                            block
                            break-all
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

                        <span className="text-slate-400">
                          None
                        </span>

                      )}

                    </dd>
                  </dl>
                </div>
              </div>
            </section>

            {/* Documents */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-slate-900">Documents</h2>
                  <dl className="mt-3 grid gap-y-2 text-sm text-slate-600 sm:grid-cols-[140px_1fr] sm:gap-x-4">

                    <dt className="font-medium text-slate-900">
                      Identity Proof
                    </dt>

                    <dd>
                      <UploadedFileView
                        file={provider.documents.identityProof}
                      />
                    </dd>


                    <dt className="font-medium text-slate-900">
                      Profile Image
                    </dt>

                    <dd>
                      <UploadedFileView
                        file={provider.documents.profileImage}
                      />
                    </dd>


                    <dt className="font-medium text-slate-900">
                      Community Photos
                    </dt>

                    <dd>
                      {provider.documents.previousCommunityPhotos?.length ? (

                        <div className="space-y-1">

                          {provider.documents.previousCommunityPhotos.map(
                            photo => (
                              <UploadedFileView
                                key={photo.key}
                                file={photo}
                              />
                            )
                          )}

                        </div>

                      ) : (

                        <span className="text-slate-400">
                          Not uploaded
                        </span>

                      )}
                    </dd>

                  </dl>
                </div>
              </div>
            </section>

            {/* Volunteer group */}
            {provider.volunteerGroupProfile && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-start gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">

                    <h2 className="font-semibold text-slate-900">
                      Volunteer Group Details
                    </h2>

                    <dl className="mt-3 grid gap-y-2 text-sm text-slate-600 sm:grid-cols-[140px_1fr] sm:gap-x-4">

                      <dt className="font-medium text-slate-900">
                        Member Count
                      </dt>

                      <dd>
                        {provider.volunteerGroupProfile.memberCount}
                      </dd>

                      {provider.documents.logo && (
                        <>
                          <dt className="font-medium text-slate-900">
                            Group Logo
                          </dt>

                          <dd>
                            <UploadedFileView
                              file={provider.documents.logo}
                            />
                          </dd>
                        </>
                      )}

                    </dl>

                  </div>

                </div>

              </section>
            )}

            {provider.organizationProfile && (
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-start gap-4">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Building2 className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">

                    <h2 className="font-semibold text-slate-900">
                      Organization Details
                    </h2>

                    <dl className="mt-3 grid gap-y-2 text-sm text-slate-600 sm:grid-cols-[140px_1fr] sm:gap-x-4">

                      <dt className="font-medium text-slate-900">
                        Member Count
                      </dt>

                      <dd>
                        {provider.organizationProfile.memberCount}
                      </dd>


                      {provider.documents.ngoRegistrationDocument && (
                        <>
                          <dt className="font-medium text-slate-900">
                            NGO Registration
                          </dt>

                          <dd>
                            <UploadedFileView
                              file={
                                provider.documents
                                  .ngoRegistrationDocument
                              }
                            />
                          </dd>
                        </>
                      )}


                      {provider.documents.logo && (
                        <>
                          <dt className="font-medium text-slate-900">
                            NGO Logo
                          </dt>

                          <dd>
                            <UploadedFileView
                              file={provider.documents.logo}
                            />
                          </dd>
                        </>
                      )}

                    </dl>

                  </div>

                </div>

              </section>
            )}


          </div>
        </div>
      </main>

      {/* Footer */}
    </MainLayout>
  );
}

export default ProviderSubmissionPage;

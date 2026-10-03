import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  FileText,
  User,
  Briefcase,
  ClipboardCheck,
  Users,
  Building2,
  RefreshCw,
} from "lucide-react";

import { getProviderProfile } from "../services/providerService";

import type { ProviderProfile } from "../types/providerProfile";

import { useProviderOnboardingStore } from "../store/providerOnboardingStore";

import { ApplicationStatus } from "../constants/applicationStatus";

import MainLayout from "../../../layouts/MainLayout";

import ProviderIdentitySection from "../components/ProviderIdentitySection";

import ProviderDocumentsSection from "../components/ProviderDocumentsSection";

import ProviderWorkPreferencesSection from "../components/ProviderWorkPreferencesSection";

import ProviderOrganizationSection from "../components/ProviderOrganizationSection";

import ProviderStatusSection from "../components/ProviderStatusSection";

function ProviderSubmissionPage() {
  
  const navigate = useNavigate();
  
  const hydrateDraft = useProviderOnboardingStore((s) => s.hydrateDraft);

  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  
  const [loading, setLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    
    const fetchProviderProfile = async () => {
      
      try {
        
        const data = await getProviderProfile();
        
        setProvider(data.provider);
      
      } catch (err) {
        
        console.error(err);
        
        setError("Unable to load your application.");
      
      } finally {
        
        setLoading(false);
      
      }
    
    };

    fetchProviderProfile();
  
  }, []);

  const handleResubmit = () => {
    
    if (!provider) return;

    // Hydrate the onboarding store from the existing provider profile so the
    // provider sees their current data pre-filled in the form.
    hydrateDraft({
      
      providerType: provider.identity.providerType,
      
      providerName: provider.identity.providerName,
      
      responsiblePersonName: provider.identity.responsiblePersonName,
      
      address: provider.identity.address,
      
      phone: provider.identity.phone,
      
      identityProof: provider.documents.identityProof,
      
      profileImage: provider.documents.profileImage,
      
      previousCommunityPhotos: provider.documents.previousCommunityPhotos,
      
      categoriesWillingToWork: provider.workPreferences.categoriesWillingToWork,
      
      websiteLinks: provider.workPreferences.websiteLinks,
      
      ...(provider.volunteerGroupProfile && {
        
        volunteerGroupProfile: {
          
          memberCount: provider.volunteerGroupProfile.memberCount,
          
          logo: provider.documents.logo,
        
        },
      
      }),
      
      ...(provider.organizationProfile && {
        
        organizationProfile: {
          
          memberCount: provider.organizationProfile.memberCount,
          
          ngoRegistrationDocument: provider.documents.ngoRegistrationDocument,
          
          logo: provider.documents.logo,
        
        },
      
      }),
    
    });

    
    navigate("/provider/onboarding/step-2");
  };

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

  const applicationStatus = provider.status.applicationStatus;
  
  const isRejected = applicationStatus === ApplicationStatus.REJECTED;

  return (
    
    <MainLayout>
      
      <main className="flex flex-1 flex-col px-4 py-10 sm:py-14">
        
        <div className="mx-auto w-full max-w-3xl">
          
          <Link
            
            to="/provider/application-submitted"
            
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
          
          >
            <ArrowLeft className="h-4 w-4" />
            
            Back to welcome
          
          </Link>

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            
            <div>
              
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                
                Your Provider Application
              
              </h1>
              
              <p className="mt-2 text-base text-slate-500">
                
                Here are the details you submitted for review.
              
              </p>
            
            </div>

            {isRejected && (
              <button
                type="button"
                onClick={handleResubmit}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer self-start"
              >
                <RefreshCw className="h-4 w-4" />
                Resubmit Application
              </button>
            )}
          </div>

          <div className="mt-8 space-y-6">
            <ProviderStatusSection
              icon={<ClipboardCheck className="h-5 w-5" />}
              status={{
                applicationStatus: provider.status.applicationStatus,
                submittedAt: provider.status.submittedAt,
                reviewedAt: provider.status.reviewedAt,
                rejectionReason: provider.status.rejectionReason,
              }}
            />

            <ProviderIdentitySection
              title="Provider Information"
              icon={<User className="h-5 w-5" />}
              data={{
                providerType: provider.identity.providerType,
                providerName: provider.identity.providerName,
                responsiblePersonName: provider.identity.responsiblePersonName,
                address: provider.identity.address,
                phone: provider.identity.phone,
              }}
            />

            <ProviderWorkPreferencesSection
              icon={<Briefcase className="h-5 w-5" />}
              data={{
                categoriesWillingToWork: provider.workPreferences.categoriesWillingToWork,
                websiteLinks: provider.workPreferences.websiteLinks,
              }}
            />

            <ProviderDocumentsSection
              icon={<FileText className="h-5 w-5" />}
              providerType={provider.identity.providerType}
              documents={{
                identityProof: provider.documents.identityProof,
                profileImage: provider.documents.profileImage,
                previousCommunityPhotos: provider.documents.previousCommunityPhotos,
              }}
            />

            <ProviderOrganizationSection
              icon={
                provider.volunteerGroupProfile ? (
                  <Users className="h-5 w-5" />
                ) : (
                  <Building2 className="h-5 w-5" />
                )
              }
              data={{
                providerType: provider.identity.providerType,
                volunteerGroupProfile: provider.volunteerGroupProfile,
                organizationProfile: provider.organizationProfile,
                documents: provider.documents,
              }}
            />
          </div>
        </div>
      </main>
    </MainLayout>
  );
}

export default ProviderSubmissionPage;

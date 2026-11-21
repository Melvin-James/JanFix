import React, { useState } from "react";
import { Users, Building2, User, Award, Images } from "lucide-react";
import type { PublicProviderProfile } from "../../types/issue";

interface ProjectSelectedProviderCardProps {
  provider?: PublicProviderProfile;
}

export const ProjectSelectedProviderCard: React.FC<ProjectSelectedProviderCardProps> = ({
  provider,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!provider) return null;

  const displayImage = provider.logo || provider.profileImage;
  const displayName = provider.organizationName || provider.fullName;

  const formatProviderType = (type: string) => {
    switch (type) {
      case "NGO":
        return "Non-Profit Organization (NGO)";
      case "VOLUNTEER_GROUP":
        return "Community Volunteer Group";
      case "INDIVIDUAL":
        return "Registered Civic Contractor";
      default:
        return type;
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <Award className="h-5 w-5 text-emerald-600" />
        <h2 className="text-base sm:text-lg font-semibold text-slate-900">
          Selected Service Provider
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Avatar / Logo */}
        <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayName}
              className="h-full w-full object-cover"
              onError={(e) => {
                // Image load failure fallback
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : provider.providerType === "NGO" ? (
            <Building2 className="h-8 w-8 text-indigo-600" />
          ) : (
            <User className="h-8 w-8 text-blue-600" />
          )}
        </div>

        {/* Profile Info */}
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 truncate">
              {displayName}
            </h3>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
              {formatProviderType(provider.providerType)}
            </span>
          </div>

          {provider.teamSize && (
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span>Team Capacity: {provider.teamSize} active members</span>
            </p>
          )}

          {provider.bio && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 line-clamp-3">
              {provider.bio}
            </p>
          )}
        </div>
      </div>

      {/* Community Work Photos Gallery */}
      {provider.communityPhotos && provider.communityPhotos.length > 0 && (
        <div className="space-y-2.5 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Images className="h-4 w-4 text-slate-400" />
            <span>Past Community Service Portfolio</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {provider.communityPhotos.map((photoUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPhoto(photoUrl)}
                className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 hover:border-blue-500 transition-colors cursor-pointer"
              >
                <img
                  src={photoUrl}
                  alt={`Portfolio ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          {selectedPhoto && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              onClick={() => setSelectedPhoto(null)}
            >
              <div
                className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-xl bg-white p-2 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedPhoto}
                  alt="Portfolio Enlarge"
                  className="max-h-[80vh] w-auto rounded-lg object-contain"
                />
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-white hover:bg-black/80"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


import React, { useEffect, useState, useCallback } from "react";
import { Users, Heart, Loader2, MessageSquare, ChevronDown } from "lucide-react";
import { getIssueDonations } from "../../../donations/services/donationService";
import type { PublicDonor } from "../../../donations/types/donationTypes";

interface CommunityContributorsSectionProps {
  issueId: string;
  refreshTrigger?: number;
}

export const CommunityContributorsSection: React.FC<
  CommunityContributorsSectionProps
> = ({ issueId, refreshTrigger = 0 }) => {
  const [donations, setDonations] = useState<PublicDonor[]>([]);
  const [totalDonors, setTotalDonors] = useState<number>(0);
  const [totalAmountRaisedPaise, setTotalAmountRaisedPaise] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const formatINR = (paise: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(paise / 100);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const getInitials = (name: string) => {
    if (!name || name === "Anonymous") return "A";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const fetchDonations = useCallback(
    async (targetPage = 1, append = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        const res = await getIssueDonations(issueId, targetPage, 6);

        if (append) {
          setDonations((prev) => [...prev, ...res.donations]);
        } else {
          setDonations(res.donations);
        }

        setTotalDonors(res.totalDonors);
        setTotalAmountRaisedPaise(res.totalAmountRaisedPaise);
        setPage(res.page);
        setTotalPages(res.totalPages);
      } catch (err) {
        console.error("Failed to fetch issue donations:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [issueId]
  );

  useEffect(() => {
    fetchDonations(1, false);
  }, [fetchDonations, refreshTrigger]);

  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore) {
      fetchDonations(page + 1, true);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base sm:text-lg">
            <Users className="h-5 w-5 text-emerald-600 shrink-0" />
            <h2>Community Contributors</h2>
            {totalDonors > 0 && (
              <span className="ml-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 font-bold">
                {totalDonors}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Citizens and organizations supporting this civic resolution.
          </p>
        </div>

        {totalAmountRaisedPaise > 0 && (
          <div className="text-right self-start sm:self-auto">
            <span className="text-xs text-slate-500 block">Total Contributed:</span>
            <span className="text-base font-bold text-emerald-800">
              {formatINR(totalAmountRaisedPaise)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-8 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-xs">Loading community contributors...</span>
        </div>
      ) : donations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center space-y-2 bg-slate-50/50">
          <Heart className="h-8 w-8 text-slate-300 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-700">
            No community contributions yet
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first citizen to support this project and help your neighborhood get this issue resolved!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {donations.map((donor) => (
              <div
                key={donor.id}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        donor.isAnonymous
                          ? "bg-slate-200 text-slate-600"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {donor.isAnonymous ? (
                        <Heart className="h-4 w-4" />
                      ) : (
                        getInitials(donor.donorName)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {donor.donorName}
                      </h4>
                      <span className="text-[11px] text-slate-400 block">
                        {formatDate(donor.createdAt)}
                      </span>
                    </div>
                  </div>

                  <span className="text-sm font-bold text-emerald-700 shrink-0 font-mono">
                    {formatINR(donor.amountPaise)}
                  </span>
                </div>

                {donor.message && (
                  <div className="rounded-md bg-white p-2 text-xs text-slate-600 italic border border-slate-100 flex items-start gap-1.5">
                    <MessageSquare className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">&quot;{donor.message}&quot;</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination: View More Button */}
          {page < totalPages && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Loading more...</span>
                  </>
                ) : (
                  <>
                    <span>View More Contributors</span>
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

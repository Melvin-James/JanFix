import React, { useEffect, useState } from "react";
import { Layers, AlertCircle } from "lucide-react";
import { IssueCard } from "../../issues/components/IssueCard";
import { getProviderIssues } from "../services/providerService";
import type { ProviderIssue } from "../types/providerTypes";

interface SimilarIssuesSectionProps {
  categoryId: string;
  currentIssueId: string;
}

export const SimilarIssuesSection: React.FC<SimilarIssuesSectionProps> = ({
  categoryId,
  currentIssueId,
}) => {
  const [similarIssues, setSimilarIssues] = useState<ProviderIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!categoryId) {
      setLoading(false);
      return;
    }

    const fetchSimilar = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getProviderIssues({
          category: categoryId,
          pageSize: 6,
          page: 1,
        });

        if (!isMounted) return;
        const filtered = (res.issues || [])
          .filter((iss) => iss.id !== currentIssueId)
          .slice(0, 4);

        setSimilarIssues(filtered);
      } catch (err: unknown) {
        if (!isMounted) return;
        console.error("Failed to load similar provider issues:", err);
        setError("Could not load similar issues.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSimilar();

    return () => {
      isMounted = false;
    };
  }, [categoryId, currentIssueId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg">
          <Layers className="h-5 w-5 text-blue-600" />
          <span>Similar Issues in this Category</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error || similarIssues.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg">
          <Layers className="h-5 w-5 text-blue-600" />
          <span>Similar Issues in this Category</span>
        </div>
        <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          <AlertCircle className="mx-auto h-6 w-6 text-slate-400 mb-1.5" />
          <p>No other similar issues found in this category.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-lg">
          <Layers className="h-5 w-5 text-blue-600" />
          <span>Similar Issues in this Category</span>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          Showing {similarIssues.length} related {similarIssues.length === 1 ? "issue" : "issues"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {similarIssues.map((simIssue) => (
          <IssueCard
            key={simIssue.id}
            variant="provider"
            issue={simIssue}
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarIssuesSection;

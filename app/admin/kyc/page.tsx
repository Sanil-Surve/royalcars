"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/src/lib/api";
import { KYCDocument, User } from "@/src/types";
import { formatApiError } from "@/src/lib/utils";
import { toast } from "sonner";
import {
  FileCheck,
  Check,
  X,
  Eye,
  Clock,
  ShieldCheck,
  User as UserIcon,
  RefreshCw,
} from "lucide-react";

interface KYCQueueItem {
  user: User;
  documents: KYCDocument[];
}

export default function AdminKYCPage() {
  const [queue, setQueue] = useState<KYCQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<KYCDocument | null>(null);

  // Review Note Modal State
  const [reviewingDoc, setReviewingDoc] = useState<KYCDocument | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved");
  const [adminNotes, setAdminNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadQueue = () => {
    setLoading(true);
    api
      .get<KYCQueueItem[]>("/kyc/queue")
      .then((res) => {
        setQueue(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(formatApiError(err));
        setLoading(false);
      });
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingDoc) return;
    setSubmitting(true);
    try {
      await api.post(`/kyc/${reviewingDoc.id}/verify`, {
        status: reviewStatus,
        notes: adminNotes || null,
      });
      toast.success(`Document marked as ${reviewStatus}!`);
      setReviewingDoc(null);
      setAdminNotes("");
      loadQueue();
    } catch (err: any) {
      toast.error(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">KYC Verification Queue</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review customer Driving Licenses and Aadhaar cards before keyless vehicle handover.
          </p>
        </div>

        <button
          onClick={loadQueue}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Queue
        </button>
      </div>

      {queue.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0A192F] border border-slate-800 text-center space-y-3">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="font-heading text-lg font-bold text-white">KYC Queue is Clean</h3>
          <p className="text-xs text-slate-400">All submitted driver documents have been reviewed and processed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {queue.map(({ user, documents }) => (
            <div
              key={user.id}
              className="p-6 rounded-3xl bg-[#0A192F] border border-slate-800 space-y-4 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-[#D4AF37]">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{user.name}</h3>
                    <p className="text-xs text-slate-400">{user.email} · {user.phone || "No phone"}</p>
                  </div>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Status: {user.kyc_status}
                </span>
              </div>

              {/* Uploaded Documents List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                        <span className="capitalize">{doc.document_type.replace("_", " ")}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            doc.verification_status === "approved"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : doc.verification_status === "rejected"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {doc.verification_status}
                        </span>
                      </div>
                      {doc.admin_notes && (
                        <p className="text-[10px] text-amber-300 mt-1 italic">&ldquo;{doc.admin_notes}&rdquo;</p>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => setSelectedPreviewDoc(doc)}
                        className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#D4AF37]" /> Inspect Document
                      </button>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            setReviewingDoc(doc);
                            setReviewStatus("approved");
                            setAdminNotes("Approved. Clear and valid.");
                          }}
                          className="py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => {
                            setReviewingDoc(doc);
                            setReviewStatus("rejected");
                            setAdminNotes("Unclear image or expired license.");
                          }}
                          className="py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-slate-700 p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading text-base font-bold text-white">
                Verify {reviewingDoc.document_type.replace("_", " ").toUpperCase()}
              </h3>
              <button onClick={() => setReviewingDoc(null)} className="text-xs text-slate-400 hover:text-white">
                Cancel
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase text-slate-400">Action Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus("approved")}
                    className={`py-2 rounded-xl font-bold uppercase transition-colors ${
                      reviewStatus === "approved"
                        ? "bg-emerald-600 text-white shadow"
                        : "bg-slate-900 text-slate-400"
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus("rejected")}
                    className={`py-2 rounded-xl font-bold uppercase transition-colors ${
                      reviewStatus === "rejected"
                        ? "bg-rose-600 text-white shadow"
                        : "bg-slate-900 text-slate-400"
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase text-slate-400">Reviewer Notes (Shown to customer)</label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Approved or Please re-upload without flash reflection"
                  className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 px-3 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewingDoc(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold uppercase tracking-wider"
                >
                  {submitting ? "Saving..." : "Submit Verification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Image Zoom Preview Modal */}
      {selectedPreviewDoc && (
        <div
          onClick={() => setSelectedPreviewDoc(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md cursor-zoom-out"
        >
          <div className="max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedPreviewDoc.file_url}
              alt="Document Preview"
              className="max-h-[80vh] w-auto object-contain mx-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

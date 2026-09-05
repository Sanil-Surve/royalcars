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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion } from "motion/react";

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

        <Button
          variant="outline"
          size="sm"
          onClick={loadQueue}
          className="border-slate-700 bg-slate-900 text-xs font-semibold text-slate-200 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh Queue
        </Button>
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

                <Badge variant="outline" className="text-xs font-bold px-3 py-1 uppercase tracking-wider bg-amber-500/20 text-amber-400 border-amber-500/30">
                  Status: {user.kyc_status}
                </Badge>
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
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold uppercase ${
                            doc.verification_status === "approved"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : doc.verification_status === "rejected"
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {doc.verification_status}
                        </Badge>
                      </div>
                      {doc.admin_notes && (
                        <p className="text-[10px] text-amber-300 mt-1 italic">&ldquo;{doc.admin_notes}&rdquo;</p>
                      )}
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedPreviewDoc(doc)}
                        className="w-full h-8 text-xs font-medium flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#D4AF37]" /> Inspect Document
                      </Button>

                      <div className="grid grid-cols-2 gap-1.5">
                        <Button
                          size="xs"
                          onClick={() => {
                            setReviewingDoc(doc);
                            setReviewStatus("approved");
                            setAdminNotes("Approved. Clear and valid.");
                          }}
                          className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold"
                        >
                          <Check className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => {
                            setReviewingDoc(doc);
                            setReviewStatus("rejected");
                            setAdminNotes("Unclear image or expired license.");
                          }}
                          className="bg-rose-600/90 hover:bg-rose-500 text-white font-bold"
                        >
                          <X className="w-3 h-3 mr-1" /> Reject
                        </Button>
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
      <Dialog open={Boolean(reviewingDoc)} onOpenChange={(open) => !open && setReviewingDoc(null)}>
        {reviewingDoc && (
          <DialogContent className="sm:max-w-md bg-[#0A192F] border-slate-700 text-slate-100 p-6 space-y-4 shadow-2xl">
            <DialogHeader className="pb-3 border-b border-slate-800">
              <DialogTitle className="font-heading text-base font-bold text-white">
                Verify {reviewingDoc.document_type.replace("_", " ").toUpperCase()}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Set approval status and enter verification remarks visible to the customer.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Action Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={reviewStatus === "approved" ? "default" : "outline"}
                    onClick={() => setReviewStatus("approved")}
                    className={`font-bold uppercase ${
                      reviewStatus === "approved"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : "border-slate-700 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant={reviewStatus === "rejected" ? "default" : "outline"}
                    onClick={() => setReviewStatus("rejected")}
                    className={`font-bold uppercase ${
                      reviewStatus === "rejected"
                        ? "bg-rose-600 hover:bg-rose-500 text-white"
                        : "border-slate-700 text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    Reject
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Reviewer Notes (Shown to customer)</label>
                <Input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Approved or Please re-upload without flash reflection"
                  className="bg-slate-900/90 border-slate-700 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewingDoc(null)}
                  className="border-slate-700 text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#D4AF37] hover:bg-amber-400 text-[#0A192F] font-bold uppercase tracking-wider"
                >
                  {submitting ? "Saving..." : "Submit Verification"}
                </Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>

      {/* Document Image Zoom Preview Modal */}
      <Dialog open={Boolean(selectedPreviewDoc)} onOpenChange={(open) => !open && setSelectedPreviewDoc(null)}>
        {selectedPreviewDoc && (
          <DialogContent className="sm:max-w-3xl bg-slate-950 border-slate-700 p-3 shadow-2xl">
            <DialogHeader className="p-2 border-b border-slate-800">
              <DialogTitle className="text-xs uppercase font-bold text-slate-300">
                Document Inspection · {selectedPreviewDoc.document_type.replace("_", " ").toUpperCase()}
              </DialogTitle>
            </DialogHeader>
            <div className="flex justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPreviewDoc.file_url}
                alt="Document Preview"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-inner"
              />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";
import { KYCDocument, KYCDocumentType } from "@/src/types";
import { formatApiError } from "@/src/lib/utils";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import { toast } from "sonner";
import {
  FileCheck,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Camera,
  Eye,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";
import { motion } from "motion/react";

const REQUIRED_DOCS: { type: KYCDocumentType; title: string; desc: string; required: boolean }[] = [
  { type: "dl_front", title: "Driving License (Front)", desc: "Clear color photo showing photo & DL number", required: true },
  { type: "dl_back", title: "Driving License (Back)", desc: "Showing validity dates and class of vehicles", required: true },
  { type: "aadhar_front", title: "Aadhaar Card (Front)", desc: "Showing name, DOB, and photo", required: true },
  { type: "aadhar_back", title: "Aadhaar Card (Back)", desc: "Showing registered permanent address", required: true },
  { type: "rent_agreement", title: "Local Address Proof (Optional)", desc: "Electricity bill or rent agreement for outstation drivers", required: false },
];

export default function KYCPage() {
  return (
    <ProtectedRoute>
      <KYCContent />
    </ProtectedRoute>
  );
}

function KYCContent() {
  const { user, refreshMe } = useAuth();
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const loadKYC = () => {
    api
      .get<{ kyc_status: string; documents: KYCDocument[] }>("/kyc/my")
      .then((res) => {
        setDocuments(res.data?.documents || []);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(formatApiError(err));
        setLoading(false);
      });
  };

  useEffect(() => {
    loadKYC();
  }, []);

  const handleFileUpload = async (type: KYCDocumentType, file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB.");
      return;
    }

    const formData = new FormData();
    formData.append("document_type", type);
    formData.append("file", file);

    setUploadingType(type);
    try {
      await api.post("/kyc/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${type.replace("_", " ").toUpperCase()} uploaded successfully!`);
      loadKYC();
      refreshMe();
    } catch (err: any) {
      toast.error(formatApiError(err));
    } finally {
      setUploadingType(null);
    }
  };

  const docMap = new Map<string, KYCDocument>();
  documents.forEach((d) => docMap.set(d.document_type, d));

  return (
    <div className="w-full min-h-screen bg-[#060E1A] py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0A192F] via-[#0d213a] to-[#0A192F] border border-slate-800 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Local Trust & Verification
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-white">Driving License KYC Portal</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            As a premium self-drive service in Navi Mumbai, we verify all drivers prior to keyless vehicle handover.
            Our fleet verification team approves valid submissions within 30 minutes.
          </p>

          {/* Status Alert Banner */}
          <div className="mt-6 flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-700">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  user?.kyc_status === "approved"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : user?.kyc_status === "rejected"
                    ? "bg-rose-500/20 text-rose-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                {user?.kyc_status === "approved" ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : user?.kyc_status === "rejected" ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <Clock className="w-6 h-6" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Verification Status</p>
                <p className="text-sm font-extrabold text-white capitalize">
                  {user?.kyc_status === "approved"
                    ? "Verified Driver — Ready to Drive"
                    : user?.kyc_status === "rejected"
                    ? "Action Required: Re-upload Rejected Documents"
                    : user?.kyc_status === "pending"
                    ? "Pending Admin Verification Review"
                    : "Documents Not Yet Submitted"}
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className={`text-xs font-bold px-3 py-1.5 uppercase tracking-wider ${
                user?.kyc_status === "approved"
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  : user?.kyc_status === "rejected"
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  : "bg-amber-500/20 text-amber-400 border-amber-500/40"
              }`}
            >
              {user?.kyc_status || "Incomplete"}
            </Badge>
          </div>
        </div>

        {/* Upload Slots Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Required Documents (JPG/PNG/PDF)</h2>
            <span className="text-xs text-slate-500">Max 10MB per file</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REQUIRED_DOCS.map((doc) => {
              const existing = docMap.get(doc.type);
              const isUploading = uploadingType === doc.type;

              return (
                <div
                  key={doc.type}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                    existing?.verification_status === "approved"
                      ? "bg-slate-900/90 border-emerald-500/40"
                      : existing?.verification_status === "rejected"
                      ? "bg-rose-950/20 border-rose-500/40"
                      : existing
                      ? "bg-slate-900/90 border-[#D4AF37]/40"
                      : "bg-[#0A192F] border-slate-800"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        {doc.title}
                        {doc.required && <span className="text-rose-400">*</span>}
                      </span>

                      {existing ? (
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold px-2 py-0.5 uppercase ${
                            existing.verification_status === "approved"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : existing.verification_status === "rejected"
                              ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {existing.verification_status}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-slate-500 uppercase font-semibold border-slate-700 bg-slate-950/50">
                          Pending
                        </Badge>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400">{doc.desc}</p>

                    {existing?.admin_notes && (
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-amber-300">
                        <span className="font-semibold">Reviewer note:</span> {existing.admin_notes}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/80">
                    {existing ? (
                      <div className="flex items-center justify-between gap-2">
                        <a
                          href={existing.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            buttonVariants({ size: "sm", variant: "secondary" }),
                            "h-8 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium inline-flex items-center gap-1.5"
                          )}
                        >
                          <Eye className="w-3.5 h-3.5 text-[#D4AF37]" /> View File
                        </a>

                        {existing.verification_status !== "approved" && (
                          <label className="cursor-pointer px-3 py-1.5 rounded-md bg-[#D4AF37] text-[#0A192F] text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors inline-flex items-center">
                            {isUploading ? "Uploading..." : "Replace"}
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              disabled={isUploading}
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleFileUpload(doc.type, f);
                              }}
                            />
                          </label>
                        )}
                      </div>
                    ) : (
                      <label className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-[#D4AF37] bg-slate-950 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors">
                        <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
                        {isUploading ? "Uploading..." : "Choose File / Photo"}
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          disabled={isUploading}
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(doc.type, f);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verification Guidelines */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verification Tips
          </div>
          <ul className="space-y-1.5 pl-5 list-disc text-[11px] leading-relaxed">
            <li>Ensure the Driving License is valid and not expired. Learner permits are not eligible for self-drive.</li>
            <li>All four corners of the card should be visible with zero glare on the photo or text.</li>
            <li>Once uploaded, you will be notified and your digital keyless handover pass will be armed.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

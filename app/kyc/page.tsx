"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  CreditCard,
  FileText,
  Home,
  Eye,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Lock,
  Zap,
  Info,
  ExternalLink,
  Car,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/lib/utils";

interface DocConfig {
  type: KYCDocumentType;
  title: string;
  subtitle: string;
  desc: string;
  required: boolean;
  icon: React.ElementType;
}

const REQUIRED_DOCS: DocConfig[] = [
  {
    type: "dl_front",
    title: "Driving License (Front)",
    subtitle: "Front Side with Photo & DL No.",
    desc: "Clear color image showing your photo, full name, DL number, and date of issue.",
    required: true,
    icon: CreditCard,
  },
  {
    type: "dl_back",
    title: "Driving License (Back)",
    subtitle: "Back Side with Validity & Vehicle Class",
    desc: "Showing authorized vehicle categories (LMV), validity dates, and badge details.",
    required: true,
    icon: CreditCard,
  },
  {
    type: "aadhar_front",
    title: "Aadhaar Card (Front)",
    subtitle: "Front Side with Name & Photo",
    desc: "Government ID showing full legal name, date of birth, gender, and photograph.",
    required: true,
    icon: FileText,
  },
  {
    type: "aadhar_back",
    title: "Aadhaar Card (Back)",
    subtitle: "Back Side with Address & QR Code",
    desc: "Showing registered permanent address and official UIDAI QR code verification.",
    required: true,
    icon: FileText,
  },
  {
    type: "rent_agreement",
    title: "Local Address Proof (Optional)",
    subtitle: "Electricity Bill or Rental Agreement",
    desc: "Recommended for outstation drivers residing temporarily in Navi Mumbai or Mumbai MMR.",
    required: false,
    icon: Home,
  },
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
  const [dragOverType, setDragOverType] = useState<string | null>(null);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

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

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit. Please compress and re-upload.");
      return;
    }

    // Validate extension
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["jpg", "jpeg", "png", "pdf"].includes(ext || "")) {
      toast.error("Unsupported file type. Only JPG, PNG, and PDF files are accepted.");
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
    } catch (err: unknown) {
      toast.error(formatApiError(err));
    } finally {
      setUploadingType(null);
    }
  };

  const docMap = new Map<string, KYCDocument>();
  documents.forEach((d) => docMap.set(d.document_type, d));

  // Compute progress stats
  const mandatoryDocs = REQUIRED_DOCS.filter((d) => d.required);
  const uploadedMandatoryCount = mandatoryDocs.filter((d) => docMap.has(d.type)).length;
  const approvedMandatoryCount = mandatoryDocs.filter(
    (d) => docMap.get(d.type)?.verification_status === "approved"
  ).length;
  const progressPercent = Math.round((uploadedMandatoryCount / mandatoryDocs.length) * 100);

  const kycStatus = user?.kyc_status || "not_submitted";

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-8 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ═══════════════ Header Hero Card ═══════════════ */}
        <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden">
          {/* Subtle decorative background glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" /> Driver Identity &amp; Compliance
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Driving License &amp; KYC Verification
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                To guarantee fleet safety and enable swift, keyless vehicle handovers across our Kharghar and Panvel mall hubs, all drivers must complete government ID verification.
              </p>
            </div>

            {/* Quick status box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shrink-0">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  kycStatus === "approved" && "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
                  kycStatus === "rejected" && "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400",
                  kycStatus === "pending" && "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
                  kycStatus === "not_submitted" && "bg-blue-100 dark:bg-blue-950/60 text-primary"
                )}
              >
                {kycStatus === "approved" && <CheckCircle2 className="w-6 h-6" />}
                {kycStatus === "rejected" && <AlertCircle className="w-6 h-6" />}
                {kycStatus === "pending" && <Clock className="w-6 h-6" />}
                {kycStatus === "not_submitted" && <FileCheck className="w-6 h-6" />}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account Status</span>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white capitalize">
                  {kycStatus === "approved" && "Verified Driver"}
                  {kycStatus === "rejected" && "Action Required"}
                  {kycStatus === "pending" && "Under Review"}
                  {kycStatus === "not_submitted" && "Pending Uploads"}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {kycStatus === "approved" && "Ready for instant vehicle release"}
                  {kycStatus === "rejected" && "Re-upload rejected documents below"}
                  {kycStatus === "pending" && "Approvals take under 30 mins"}
                  {kycStatus === "not_submitted" && "Upload documents to begin"}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Status Banner & Progress */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Mandatory Documents Checklist:
                </span>
                <span className="text-xs font-extrabold text-primary">
                  {uploadedMandatoryCount} of {mandatoryDocs.length} Uploaded
                </span>
                {approvedMandatoryCount > 0 && (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ({approvedMandatoryCount} approved)
                  </span>
                )}
              </div>
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                {progressPercent}% Completed
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  progressPercent === 100 ? "bg-emerald-500" : "bg-primary"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ═══════════════ Documents Upload Grid ═══════════════ */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Submit Identification Documents
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supported file formats: JPG, PNG, or PDF (maximum 10MB per file).
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>256-bit Encrypted Storage</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {REQUIRED_DOCS.map((doc) => {
              const existing = docMap.get(doc.type);
              const isUploading = uploadingType === doc.type;
              const isDragOver = dragOverType === doc.type;
              const Icon = doc.icon;

              const isApproved = existing?.verification_status === "approved";
              const isRejected = existing?.verification_status === "rejected";
              const isPending = existing?.verification_status === "pending";

              return (
                <div
                  key={doc.type}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverType(doc.type);
                  }}
                  onDragLeave={() => setDragOverType(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverType(null);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload(doc.type, file);
                  }}
                  className={cn(
                    "rounded-2xl p-5 sm:p-6 bg-white dark:bg-slate-900 border transition-all duration-200 flex flex-col justify-between group",
                    isApproved && "border-emerald-200 dark:border-emerald-800/60 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700",
                    isRejected && "border-rose-200 dark:border-rose-800/60 shadow-xs hover:border-rose-300 dark:hover:border-rose-700 bg-rose-50/20 dark:bg-rose-950/10",
                    isPending && "border-amber-200 dark:border-amber-800/60 shadow-xs hover:border-amber-300 dark:hover:border-amber-700",
                    !existing && "border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700",
                    isDragOver && "ring-2 ring-primary border-primary bg-primary/5"
                  )}
                >
                  <div className="space-y-3">
                    {/* Top Row: Icon + Title + Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                            isApproved && "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
                            isRejected && "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400",
                            isPending && "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
                            !existing && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                              {doc.title}
                            </h3>
                            {doc.required ? (
                              <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50">
                                Required
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0 bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700">
                                Optional
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {doc.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {existing ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-bold px-2.5 py-1 uppercase tracking-wider shrink-0 gap-1",
                            isApproved && "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
                            isRejected && "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
                            isPending && "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                          )}
                        >
                          {isApproved && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                          {isRejected && <AlertCircle className="w-3 h-3 text-rose-500" />}
                          {isPending && <Clock className="w-3 h-3 text-amber-500" />}
                          {existing.verification_status}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider text-slate-400 border-slate-200 dark:border-slate-800 shrink-0">
                          Not Uploaded
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {doc.desc}
                    </p>

                    {/* Reviewer Note if Rejected */}
                    {existing?.admin_notes && (
                      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          <span>Reviewer Feedback</span>
                        </div>
                        <p className="text-[11px] leading-relaxed pl-5">
                          {existing.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Upload Dropzone / Action Row */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <input
                      ref={(el) => {
                        fileInputRefs.current[doc.type] = el;
                      }}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      disabled={isUploading}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(doc.type, file);
                        e.target.value = "";
                      }}
                    />

                    {existing ? (
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                            Document on File
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            • {new Date(existing.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={existing.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-primary" /> View
                          </a>

                          {/* Allow replace if not approved yet or if rejected */}
                          {!isApproved && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isUploading}
                              onClick={() => fileInputRefs.current[doc.type]?.click()}
                              className="rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold gap-1.5"
                            >
                              {isUploading ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Uploading...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Replace
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRefs.current[doc.type]?.click()}
                        className={cn(
                          "w-full flex flex-col sm:flex-row items-center justify-center gap-2 p-4 rounded-xl border border-dashed text-center cursor-pointer transition-all duration-200",
                          isDragOver
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary bg-slate-50/50 dark:bg-slate-950/40 hover:bg-primary/5 text-slate-600 dark:text-slate-300"
                        )}
                      >
                        {isUploading ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Uploading document to secure server...</span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-xs font-semibold">
                              Click to choose file or drag &amp; drop here
                            </span>
                            <span className="text-[10px] text-slate-400">
                              (JPG, PNG, PDF up to 10MB)
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════════ Trust & Verification Guidelines ═══════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Rapid 30-Min Approval
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Our verification hub operates 7 days a week from 05:00 AM to 11:00 PM. Submissions are processed swiftly to ensure no delay in vehicle handover.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Confidential &amp; Encrypted
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your government identity documents are encrypted end-to-end and solely utilized for Motor Vehicles Act compliance and insurance verification.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Instant Keyless Pass
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Once approved, your digital keyless pass widget activates automatically on your Customer Dashboard for contactless pickup at mall hubs.
            </p>
          </div>
        </div>

        {/* ═══════════════ Action Next Steps Footer ═══════════════ */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/5 via-blue-50/60 to-slate-50 dark:from-primary/10 dark:via-slate-900 dark:to-slate-900 border border-primary/15 dark:border-primary/25 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Ready to embark on your journey?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse our verified fleet in Kharghar &amp; Panvel or monitor your existing bookings.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              My Dashboard
            </Link>
            <Link
              href="/vehicles"
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-1.5"
            >
              Browse Fleet <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

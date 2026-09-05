"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Building2,
  FileCheck2,
  ShieldCheck,
  Truck,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  ArrowRight,
  TrendingDown,
  Calculator,
  Receipt,
  Users,
} from "lucide-react";
import { formatINR } from "@/src/lib/utils";
import { toast } from "sonner";

export default function BusinessFleetPage() {
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fleetSize, setFleetSize] = useState("2-5 cars");
  const [duration, setDuration] = useState("Monthly Recurring");
  const [submitted, setSubmitted] = useState(false);

  // Corporate calculator state
  const [monthlySpend, setMonthlySpend] = useState<number>(75000);

  const gstCredit = Math.round(monthlySpend * 0.18);
  const annualSavings = gstCredit * 12;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !phone || !email) {
      toast.error("Please fill in your company name, phone, and corporate email.");
      return;
    }
    setSubmitted(true);
    toast.success("Corporate fleet inquiry registered! Our SME Fleet Manager will contact you within 2 hours.");
  };

  return (
    <div className="w-full min-h-screen bg-[#060E1A] py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero Banner */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0A192F] via-[#0D223F] to-[#0A192F] border border-[#D4AF37]/40 p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-5 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Building2 className="w-4 h-4" /> SME Fleet & Enterprise Mode
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Smarter Mobility for Growing Businesses
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Stop depreciating owned assets. Royal Cars Business Fleet equips Navi Mumbai & Mumbai SMEs with
              flexible recurring self-drive rentals, seamless 18% GST tax invoicing, and priority executive car dispatch.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#inquiry"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-400 text-[#0A192F] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#D4AF37]/25 transition-all"
              >
                Request Corporate Account Quote &rarr;
              </a>
              <Link
                href="/vehicles?business=1"
                className="px-6 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
              >
                Book with Instant GST Billing
              </Link>
            </div>
          </div>
        </div>

        {/* Corporate Perks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-[#0A192F] border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-bold text-white">Full GST Invoicing & ITC</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every trip automatically produces a compliant GST tax invoice with your company’s legal name and GSTIN.
              Claim 18% Input Tax Credit directly on your GSTR-2B.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#0A192F] border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-bold text-white">Zero Deposit Corporate Line</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verified corporate accounts operate on official Purchase Orders (PO) or monthly pooled billing,
              waiving upfront security deposit holds and easing your cash flow.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-[#0A192F] border border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-xl font-bold text-white">Doorstep Corporate Dispatch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Priority vehicle delivery straight to your office in CBD Belapur, Vashi, Mahape MBP, or Airoli Mindspace,
              100% sanitized with Bluetooth keyless handover.
            </p>
          </div>
        </div>

        {/* Interactive Corporate Tax Savings Calculator */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0A192F] to-[#060E1A] border border-slate-800 shadow-2xl">
          <div className="max-w-2xl mx-auto text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              <Calculator className="w-4 h-4" /> Tax Benefit Estimator
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              Calculate Your Annual SME Tax Advantage
            </h2>
            <p className="text-xs text-slate-400">
              See how much input tax credit your company reclaims compared to unorganized car rentals or cabs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-4xl mx-auto p-6 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="md:col-span-6 space-y-4">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300">Estimated Monthly Fleet Budget</span>
                <span className="font-extrabold text-[#D4AF37] text-sm">{formatINR(monthlySpend)}</span>
              </div>
              <input
                type="range"
                min={20000}
                max={300000}
                step={5000}
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full accent-[#D4AF37] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>₹20,000 / mo</span>
                <span>₹3,00,000 / mo</span>
              </div>
            </div>

            <div className="md:col-span-6 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Monthly 18% GST Input Credit</span>
                <span className="font-bold text-emerald-400 font-mono">{formatINR(gstCredit)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Annual ITC Cash Savings</span>
                <span className="font-extrabold text-xl text-[#D4AF37] font-mono">{formatINR(annualSavings)}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Plus 100% of the base rental expense qualifies as an operational business deduction (OPEX) on corporate tax filings.
              </p>
            </div>
          </div>
        </div>

        {/* Corporate Inquiry Form Section */}
        <div id="inquiry" className="p-8 sm:p-12 rounded-3xl bg-[#0A192F] border border-[#D4AF37]/30 shadow-2xl">
          <div className="max-w-2xl mx-auto">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-white">Inquiry Registered</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Thank you, <span className="text-white font-bold">{contactName}</span>. Your request for{" "}
                  <span className="text-[#D4AF37] font-bold">{companyName}</span> has been dispatched to our SME Key Account Manager.
                </p>
                <div className="pt-2">
                  <Link
                    href="/vehicles"
                    className="px-6 py-3 rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold text-xs uppercase tracking-wider"
                  >
                    Browse Fleet In The Meantime
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">Corporate Quote Request</span>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
                    Set Up Your SME Fleet Account
                  </h2>
                  <p className="text-xs text-slate-400">
                    Fill in your details below for custom corporate rates and recurring billing agreements.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Company Legal Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Logix Private Limited"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">GSTIN Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 27AAAAA0000A1Z5"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      maxLength={15}
                      className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Contact Person *</label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Official Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98200 XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Work Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="fleet@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Expected Fleet Size</label>
                    <select
                      value={fleetSize}
                      onChange={(e) => setFleetSize(e.target.value)}
                      className="w-full h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-xs text-white"
                    >
                      <option value="1 car">1 Dedicated Car</option>
                      <option value="2-5 cars">2 – 5 Cars</option>
                      <option value="6-15 cars">6 – 15 Cars</option>
                      <option value="15+ cars">15+ Fleet Expansion</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-400 text-[#0A192F] font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 transition-all"
                  >
                    Submit Corporate Request &rarr;
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

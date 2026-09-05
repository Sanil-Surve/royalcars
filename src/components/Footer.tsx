"use client";

import React from "react";
import Link from "next/link";
import { Crown, MapPin, PhoneCall, Mail, ShieldCheck, Clock, Building2, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#050C1A] border-t border-slate-800/80 text-slate-400 text-xs">
      {/* Upper features strip */}
      <div className="border-b border-slate-800/60 bg-[#0A192F]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Self-Drive Convenience</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Instant booking, doorstep delivery, keyless digital unlock.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Local Trust Guaranteed</p>
              <p className="text-[11px] text-slate-400 mt-0.5">100% sanitized fleet, verified drivers, Kharghar & Panvel hubs.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Flexible Pricing Tiers</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Hourly, daily & monthly subscription passes with tiered savings.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Business Fleet Mode</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Corporate accounts for SMEs with GST invoicing & priority cars.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37] flex items-center justify-center text-[#0A192F] font-bold">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <span className="font-heading text-lg font-bold text-white">Royal Cars</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Navi Mumbai’s premier self-drive luxury rental experience. Hand-picked fleet with transparent pricing and zero hidden surge fees.
          </p>
          <div className="pt-2 flex items-center gap-3 text-slate-300">
            <span className="text-[11px] font-mono text-[#D4AF37]">CIN: U50100MH2024PTC394821</span>
          </div>
        </div>

        {/* Hub Locations */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Pickup Hubs</h4>
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-200">Kharghar Hub</p>
                <p className="text-[11px] text-slate-400">Little World Mall, Sector 2, Kharghar, Navi Mumbai</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-200">Panvel Hub</p>
                <p className="text-[11px] text-slate-400">Orion Mall, Near Station, Panvel, Navi Mumbai</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet & Services */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Services & Fleet</h4>
          <ul className="space-y-1.5 pt-1">
            <li>
              <Link href="/vehicles" className="hover:text-white transition-colors">
                Browse All Vehicles
              </Link>
            </li>
            <li>
              <Link href="/vehicles?type=SUV" className="hover:text-white transition-colors">
                Luxury SUVs (Creta, Innova Crysta)
              </Link>
            </li>
            <li>
              <Link href="/vehicles?type=Sedan" className="hover:text-white transition-colors">
                Premium Sedans (Honda City)
              </Link>
            </li>
            <li>
              <Link href="/business" className="hover:text-white transition-colors">
                SME Corporate Fleet & GST Invoicing
              </Link>
            </li>
            <li>
              <Link href="/kyc" className="hover:text-white transition-colors">
                Online KYC Verification Center
              </Link>
            </li>
          </ul>
        </div>

        {/* 24/7 Hotline Contact */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">24/7 Fleet Support</h4>
          <div className="space-y-2 pt-1 text-slate-300">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#D4AF37]" />
              <a href="tel:+919820012345" className="hover:text-white transition-colors">
                +91 98200 12345 (Kharghar)
              </a>
            </div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#D4AF37]" />
              <a href="tel:+919820054321" className="hover:text-white transition-colors">
                +91 98200 54321 (Panvel)
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#D4AF37]" />
              <a href="mailto:booking@royalrentalcars.in" className="hover:text-white transition-colors">
                booking@royalrentalcars.in
              </a>
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              Handover hours: 05:00 AM – 11:00 PM Daily
            </p>
          </div>
        </div>
      </div>

      {/* Bottom copyright & disclaimer */}
      <div className="border-t border-slate-900 bg-[#030712] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div>
            © {new Date().getFullYear()} Royal Cars Self-Drive Rentals. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Doorstep Delivery Available Across Navi Mumbai</span>
            <span>·</span>
            <span className="text-slate-400">GST Input Tax Credit Eligible</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

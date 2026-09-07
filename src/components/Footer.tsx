"use client";

import React from "react";
import Link from "next/link";
import { Crown, MapPin, Mail, Phone, ArrowRight } from "lucide-react";

export default function Footer() {
  const areas = [
    "Kharghar",
    "Panvel",
  ];

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm transition-colors">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Areas We Serve Section */}
        <section id="areas-we-serve" className="py-12 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Areas we serve
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Car rentals across Kharghar and Panvel. Pick your area for local rates and fast doorstep delivery.
              </p>
            </div>
            <Link
              className="text-sm font-semibold text-primary hover:underline underline-offset-4 shrink-0 inline-flex items-center gap-1"
              href="/vehicles"
            >
              Browse the fleet <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ul className="mt-7 grid grid-cols-2 gap-x-6 gap-y-3 max-w-xs">
            {areas.map((area) => (
              <li key={area}>
                <Link
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-1.5"
                  href={`/vehicles?location=${encodeURIComponent(area)}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                  {area}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 4-Column Directory Grid */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link className="flex items-center gap-2.5" href="/">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-md shadow-primary/20">
                <Crown className="w-4 h-4 fill-current" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Royal<span className="text-primary"> Cars</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs">
              Premium car rentals in Kharghar and Panvel. Complete freedom on wheels with thoroughly sanitized, insured, and verified vehicles.
            </p>
            <div className="flex items-center gap-3 pt-1 text-slate-400">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                Navi Mumbai Hub: Little World Mall, Kharghar
              </span>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/vehicles" className="hover:text-primary transition-colors">
                  Our Fleet Catalog
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-primary transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/#location" className="hover:text-primary transition-colors">
                  Pickup Hubs & Directions
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Legal & Policies
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Terms & Conditions
                </span>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Refund & Cancellation Policy
                </span>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Security Deposit Guidelines
                </span>
              </li>
              <li>
                <span className="hover:text-primary transition-colors cursor-pointer">
                  Vehicle Usage Agreement
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Hub */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Contact & Helplines
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Little World Mall, Sector 2, Kharghar, Navi Mumbai, 410210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:support@royalcars.in" className="hover:text-primary transition-colors">
                  support@royalcars.in
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+918369434018" className="hover:text-primary transition-colors font-medium">
                  +91 83694 34018
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+917775044441" className="hover:text-primary transition-colors font-medium">
                  +91 77750 44441
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Royal Cars Rentals. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Kharghar & Panvel</span>
            <span>•</span>
            <span>Doorstep Delivery Available</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

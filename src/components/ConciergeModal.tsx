"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { PhoneCall, MessageSquare, ShieldAlert, Sparkles, MapPin, Clock, Headset } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ConciergeModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating 24/7 Helpline & Concierge Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label="24/7 Fleet Helpline & Concierge"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/30 transition-all group"
      >
        <div className="relative flex items-center justify-center">
          <Headset className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-100 leading-none mb-0.5">
            24/7 Helpline
          </span>
          <span className="text-xs font-bold leading-none text-white">
            +91 836 943 4018
          </span>
        </div>
      </motion.button>

      {/* Concierge Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-slate-100 overflow-hidden rounded-3xl">
          {/* Blue gradient top border accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

          <DialogHeader className="flex flex-row items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Headset className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Royal Cars Concierge <Sparkles className="w-4 h-4 text-blue-600" />
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                24/7 local support & real-time Navi Mumbai booking assistance
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 mt-2">
            {/* Primary 24/7 Hotline */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Primary Helpline (24/7)
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white">+91 836 943 4018</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Immediate fleet support & booking assistance</p>
              </div>
              <a href="tel:+918369434018">
                <Button size="sm" className="bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20">
                  <PhoneCall className="w-3.5 h-3.5 mr-1" /> Call Now
                </Button>
              </a>
            </div>

            {/* Kharghar Hub Manager */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" /> Kharghar Hub
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Little World Mall Fleet Office</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Sector 2, Kharghar · 05:00 AM – 11:00 PM
                </p>
              </div>
              <a href="tel:+918369434018">
                <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-700 font-semibold text-xs rounded-xl">
                  <PhoneCall className="w-3.5 h-3.5 mr-1" /> Call Hub
                </Button>
              </a>
            </div>

            {/* WhatsApp Chat */}
            <a
              href="https://wa.me/918369434018?text=Hello%20Royal%20Cars,%20I%20need%20assistance%20with%20my%20booking."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/40 transition-colors block"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">WhatsApp Instant Concierge</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">Average response time under 3 minutes</p>
                </div>
              </div>
              <Badge className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 border-none">
                Chat Now &rarr;
              </Badge>
            </a>

            {/* Emergency Roadside Assistance */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-bold text-slate-900 dark:text-white">24/7 Breakdown & RSA:</span> Free roadside assistance, flat tyre support,
                and towing included with every rental across Mumbai & Pune Expressway.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


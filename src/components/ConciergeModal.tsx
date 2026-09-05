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
      {/* Floating Concierge Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="24/7 Fleet Concierge & Roadside Support"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#0A192F] to-[#172A45] border border-[#D4AF37]/50 text-white shadow-xl shadow-black/40 hover:shadow-2xl hover:border-[#D4AF37] transition-all group"
      >
        <div className="relative">
          <Headset className="w-5 h-5 text-[#D4AF37] group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
        </div>
        <span className="text-xs font-semibold tracking-wide uppercase text-slate-200 group-hover:text-white">
          24/7 Concierge
        </span>
      </motion.button>

      {/* Concierge Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg bg-[#0A192F] border border-slate-700/80 p-6 sm:p-7 shadow-2xl text-slate-100 overflow-hidden rounded-3xl">
          {/* Gold gradient top border accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37]" />

          <DialogHeader className="flex flex-row items-center gap-3 pb-3 border-b border-slate-800 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
              <Headset className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-lg font-bold text-white flex items-center gap-2">
                Royal Concierge <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Local trust & real-time Navi Mumbai assistance
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 mt-2">
            {/* Kharghar Hub Manager */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" /> Kharghar Hub
                </div>
                <p className="text-sm font-medium text-white">Little World Mall Fleet Office</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 05:00 AM – 11:00 PM Active Handover
                </p>
              </div>
              <a href="tel:+919820012345">
                <Button size="sm" className="bg-[#D4AF37] text-[#0A192F] font-bold text-xs hover:bg-amber-400 rounded-xl">
                  <PhoneCall className="w-3.5 h-3.5 mr-1" /> Call Hub
                </Button>
              </a>
            </div>

            {/* Panvel Hub Manager */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" /> Panvel Hub
                </div>
                <p className="text-sm font-medium text-white">Orion Mall Fleet Hub (Station Rd)</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 05:00 AM – 11:00 PM Active Handover
                </p>
              </div>
              <a href="tel:+919820054321">
                <Button size="sm" className="bg-[#D4AF37] text-[#0A192F] font-bold text-xs hover:bg-amber-400 rounded-xl">
                  <PhoneCall className="w-3.5 h-3.5 mr-1" /> Call Hub
                </Button>
              </a>
            </div>

            {/* WhatsApp Chat */}
            <a
              href="https://wa.me/919820012345?text=Hello%20Royal%20Cars%20Concierge,%20I%20need%20assistance%20with%20my%20self-drive%20booking."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/40 transition-colors block"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/30 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-200">WhatsApp Instant Concierge</p>
                  <p className="text-xs text-emerald-400/80">Average response time under 3 minutes</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs font-semibold text-emerald-300 bg-emerald-900/60 border-emerald-700">
                Chat Now &rarr;
              </Badge>
            </a>

            {/* Emergency Roadside Assistance */}
            <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-900/40 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-200/90 leading-relaxed">
                <span className="font-bold text-rose-300">24/7 Breakdown & RSA:</span> Free towing, flat tyre assistance,
                and battery jumpstart included with every rental across Mumbai & Pune Expressway.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


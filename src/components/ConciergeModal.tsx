"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PhoneCall, MessageSquare, ShieldAlert, X, Sparkles, MapPin, Clock, Headset } from "lucide-react";

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
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg rounded-2xl bg-[#0A192F] border border-slate-700/80 p-6 sm:p-7 shadow-2xl text-slate-100 overflow-hidden"
            >
              {/* Gold gradient top border accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-amber-400 to-[#D4AF37]" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    <Headset className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                      Royal Concierge <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    </h3>
                    <p className="text-xs text-slate-400">Local trust & real-time Navi Mumbai assistance</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {/* Kharghar Hub Manager */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5" /> Kharghar Hub
                    </div>
                    <p className="text-sm font-medium text-white">Little World Mall Fleet Office</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 05:00 AM – 11:00 PM Active Handover
                    </p>
                  </div>
                  <a
                    href="tel:+919820012345"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#D4AF37] text-[#0A192F] font-semibold text-xs hover:bg-amber-400 transition-colors shadow-md"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Call Hub
                  </a>
                </div>

                {/* Panvel Hub Manager */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5" /> Panvel Hub
                    </div>
                    <p className="text-sm font-medium text-white">Orion Mall Fleet Hub (Station Rd)</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 05:00 AM – 11:00 PM Active Handover
                    </p>
                  </div>
                  <a
                    href="tel:+919820054321"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#D4AF37] text-[#0A192F] font-semibold text-xs hover:bg-amber-400 transition-colors shadow-md"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Call Hub
                  </a>
                </div>

                {/* WhatsApp Chat */}
                <a
                  href="https://wa.me/919820012345?text=Hello%20Royal%20Cars%20Concierge,%20I%20need%20assistance%20with%20my%20self-drive%20booking."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600/30 flex items-center justify-center text-emerald-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-200">WhatsApp Instant Concierge</p>
                      <p className="text-xs text-emerald-400/80">Average response time under 3 minutes</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-300 underline">Chat Now &rarr;</span>
                </a>

                {/* Emergency Roadside Assistance */}
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/40 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-200/90 leading-relaxed">
                    <span className="font-bold text-rose-300">24/7 Breakdown & RSA:</span> Free towing, flat tyre assistance,
                    and battery jumpstart included with every rental across Mumbai & Pune Expressway.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Unlock, Key, Gauge, Fuel, Camera, ShieldCheck, AlertCircle, Sparkles, X } from "lucide-react";
import { Booking } from "@/src/types";
import { toast } from "sonner";

interface DigitalKeyModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export default function DigitalKeyModal({ booking, isOpen, onClose }: DigitalKeyModalProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isActuating, setIsActuating] = useState(false);
  const [activeTab, setActiveTab] = useState<"key" | "inspection">("key");

  const toggleLock = (targetState: boolean) => {
    setIsActuating(true);
    setTimeout(() => {
      setIsUnlocked(targetState);
      setIsActuating(false);
      if (targetState) {
        toast.success(`Unlocked ${booking.vehicle_name}. Keyless drive active.`);
      } else {
        toast.info(`Vehicle ${booking.vehicle_name} locked securely.`);
      }
    }, 600);
  };

  const triggerBeep = () => {
    toast("Beacon flashed & acoustic chirp sounded!", {
      icon: "📢",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#0A192F] via-[#0D203A] to-[#060E1A] border border-[#D4AF37]/40 p-6 shadow-2xl text-slate-100 overflow-hidden"
          >
            {/* Ambient gold glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-1.5">
                    Royal Keyless Pass <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </h3>
                  <p className="text-xs text-slate-400">Bluetooth & Cloud Handover Active</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex rounded-xl bg-slate-900/90 p-1 mt-4 border border-slate-800">
              <button
                onClick={() => setActiveTab("key")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "key"
                    ? "bg-[#D4AF37] text-[#0A192F] shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Digital Key Fob
              </button>
              <button
                onClick={() => setActiveTab("inspection")}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "inspection"
                    ? "bg-[#D4AF37] text-[#0A192F] shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Inspection Checklist
              </button>
            </div>

            {activeTab === "key" ? (
              <div className="mt-6 flex flex-col items-center">
                {/* Vehicle Fob Visual Card */}
                <div className="relative w-full rounded-2xl bg-gradient-to-br from-slate-900 to-[#112240] border border-slate-700/80 p-5 shadow-inner">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">{booking.vehicle_name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono tracking-wider uppercase">
                      Signal: 98% (BLE 5.3)
                    </span>
                  </div>

                  {/* Pulsing Car Unlock Status Circle */}
                  <div className="my-7 flex justify-center">
                    <motion.div
                      animate={{
                        boxShadow: isUnlocked
                          ? "0 0 35px 8px rgba(16, 185, 129, 0.4)"
                          : "0 0 25px 4px rgba(212, 175, 55, 0.25)",
                      }}
                      className={`relative w-28 h-28 rounded-full border-2 flex items-center justify-center transition-colors duration-500 ${
                        isUnlocked
                          ? "border-emerald-500 bg-emerald-950/40 text-emerald-400"
                          : "border-[#D4AF37] bg-slate-950/60 text-[#D4AF37]"
                      }`}
                    >
                      {isActuating ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-10 h-10 border-2 border-current border-t-transparent rounded-full"
                        />
                      ) : isUnlocked ? (
                        <Unlock className="w-11 h-11" />
                      ) : (
                        <Lock className="w-11 h-11" />
                      )}
                    </motion.div>
                  </div>

                  <p className="text-center text-xs font-medium text-slate-300 mb-2">
                    Status:{" "}
                    <span className={isUnlocked ? "text-emerald-400 font-bold" : "text-[#D4AF37] font-bold"}>
                      {isActuating ? "Communicating with Vehicle..." : isUnlocked ? "DOORS UNLOCKED" : "VEHICLE SECURED"}
                    </span>
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={isActuating}
                      onClick={() => toggleLock(!isUnlocked)}
                      className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all ${
                        isUnlocked
                          ? "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400"
                      }`}
                    >
                      {isUnlocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      {isUnlocked ? "Lock Doors" : "Unlock Doors"}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={triggerBeep}
                      className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 shadow-md"
                    >
                      <span>Horn / Flash</span>
                    </motion.button>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <span>
                    Self-drive keyless handover: Car immobilizer auto-disarms once your verified Bluetooth pass matches
                    the telematics unit.
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-5 space-y-4 max-h-[380px] overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Gauge className="w-4 h-4 text-[#D4AF37]" /> Start Odometer
                    </div>
                    <p className="text-base font-bold text-white font-mono">
                      {booking.odometer_start != null ? `${booking.odometer_start} km` : "Pending Handover"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                      <Fuel className="w-4 h-4 text-emerald-400" /> Fuel Level
                    </div>
                    <p className="text-base font-bold text-white">
                      {booking.fuel_level_start || "Full Tank (100%)"}
                    </p>
                  </div>
                </div>

                {/* Inspection Photos */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#D4AF37]" /> Pre-Ride Inspection Photos
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {booking.pickup_photos?.length || 0} photos logged
                    </span>
                  </div>

                  {booking.pickup_photos && booking.pickup_photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {booking.pickup_photos.map((photo, i) => (
                        <a
                          key={i}
                          href={photo}
                          target="_blank"
                          rel="noreferrer"
                          className="aspect-video rounded-lg overflow-hidden border border-slate-700 block relative group"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo}
                            alt={`Inspection ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-400">
                      <AlertCircle className="w-5 h-5 mx-auto mb-1 text-slate-500" />
                      Inspection photographs will appear here once the fleet executive initiates your handover.
                    </div>
                  )}
                </div>

                {booking.pickup_notes && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                    <span className="font-semibold text-[#D4AF37]">Pickup Notes:</span> {booking.pickup_notes}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/src/lib/api";
import { Location } from "@/src/types";
import { formatApiError } from "@/src/lib/utils";
import { toast } from "sonner";
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, X } from "lucide-react";

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<Location | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadLocations = () => {
    setLoading(true);
    api
      .get<Location[]>("/locations")
      .then((res) => {
        setLocations(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(formatApiError(err));
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const openAddModal = () => {
    setEditingLoc(null);
    setName("");
    setAddress("");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (loc: Location) => {
    setEditingLoc(loc);
    setName(loc.name);
    setAddress(loc.address);
    setIsActive(loc.is_active);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingLoc) {
        await api.put(`/locations/${editingLoc.id}`, { name, address, is_active: isActive });
        toast.success("Location hub updated!");
      } else {
        await api.post("/locations", { name, address, is_active: isActive });
        toast.success("New pickup hub registered!");
      }
      setIsModalOpen(false);
      loadLocations();
    } catch (err: any) {
      toast.error(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (locId: string) => {
    if (!confirm("Are you sure you want to deactivate this location hub?")) return;
    try {
      await api.delete(`/locations/${locId}`);
      toast.success("Location deactivated.");
      loadLocations();
    } catch (err: any) {
      toast.error(formatApiError(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white">Pickup Hub Locations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage Navi Mumbai fleet dispatch centers and mall parking bays.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-[#0A192F] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" /> Add Hub Location
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations.map((loc) => (
          <div
            key={loc.id}
            className="p-6 rounded-3xl bg-[#0A192F] border border-slate-800 hover:border-slate-700 transition-colors space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    loc.is_active
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {loc.is_active ? "Active Hub" : "Inactive"}
                </span>
              </div>

              <h3 className="font-heading text-lg font-bold text-white pt-1">{loc.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{loc.address}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(loc)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => handleDelete(loc.id)}
                className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-900/50 text-xs text-rose-400 hover:bg-rose-900/60 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Deactivate
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-slate-700 p-6 space-y-4 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading text-base font-bold text-white">
                {editingLoc ? "Edit Hub Location" : "Add Hub Location"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-xs text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold uppercase text-slate-400">Hub Display Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kharghar - Little World Mall"
                  className="w-full h-10 rounded-xl bg-slate-900 border border-slate-700 px-3 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold uppercase text-slate-400">Complete Address & Landmark *</label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Sector 2, Kharghar, Navi Mumbai"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-white"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#D4AF37]"
                />
                <span className="font-semibold text-white">Hub is currently active for dispatches</span>
              </label>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] text-[#0A192F] font-bold uppercase tracking-wider"
                >
                  {submitting ? "Saving..." : "Save Hub"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/src/lib/api";
import { Location } from "@/src/types";
import { formatApiError } from "@/src/lib/utils";
import { toast } from "sonner";
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

        <Button
          onClick={openAddModal}
          className="bg-[#D4AF37] hover:bg-amber-400 text-[#0A192F] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow"
        >
          <Plus className="w-4 h-4" /> Add Hub Location
        </Button>
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
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold px-2.5 py-0.5 uppercase ${
                    loc.is_active
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-800 text-slate-500 border-slate-700"
                  }`}
                >
                  {loc.is_active ? "Active Hub" : "Inactive"}
                </Badge>
              </div>

              <h3 className="font-heading text-lg font-bold text-white pt-1">{loc.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{loc.address}</p>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openEditModal(loc)}
                className="border-slate-700 bg-slate-900 text-xs text-slate-300 hover:text-white flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(loc.id)}
                className="border-rose-900/50 bg-rose-950/40 text-xs text-rose-400 hover:bg-rose-900/60 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Deactivate
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => setIsModalOpen(open)}>
        <DialogContent className="sm:max-w-md bg-[#0A192F] border-slate-700 text-slate-100 p-6 space-y-4 shadow-2xl">
          <DialogHeader className="pb-3 border-b border-slate-800">
            <DialogTitle className="font-heading text-base font-bold text-white">
              {editingLoc ? "Edit Hub Location" : "Add Hub Location"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Fleet distribution point, mall concierge desk, or parking zone details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Hub Display Name *</label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kharghar - Little World Mall"
                className="bg-slate-900/90 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-[10px] text-slate-400">Complete Address & Landmark *</label>
              <Textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Sector 2, Kharghar, Navi Mumbai"
                className="bg-slate-900/90 border-slate-700 text-white text-xs"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <p className="font-semibold text-white text-xs">Active Dispatch Hub</p>
                <p className="text-[11px] text-slate-400">Available for customer pickups and dropoffs</p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(val) => setIsActive(val)}
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="border-slate-700 text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#D4AF37] hover:bg-amber-400 text-[#0A192F] font-bold uppercase tracking-wider"
              >
                {submitting ? "Saving..." : "Save Hub"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

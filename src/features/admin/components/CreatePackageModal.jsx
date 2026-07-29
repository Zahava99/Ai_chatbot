import { useState } from "react";
import { X } from "lucide-react";
import { createPackage } from "@/api/paymentApi";

const INITIAL_FORM = {
  name: "",
  description: "",
  tokenAmount: "",
  price: "",
  validityDays: "",
  displayOrder: "",
};

export default function CreatePackageModal({ onClose, onCreated }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      tokenAmount: form.tokenAmount,
      price: form.price,
      validityDays: form.validityDays,
      displayOrder: form.displayOrder,
    };

    try {
      setCreating(true);
      await createPackage(payload);
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-panel border border-app-border rounded-2xl shadow-2xl w-full max-w-md mx-4">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
          <h2 className="text-base font-semibold text-app">Create New Package</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-app opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-app opacity-60 mb-1">Package Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="e.g. Premium"
              className="w-full px-3 py-2 rounded-lg border border-app-border bg-app text-app text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-app opacity-60 mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional description"
              className="w-full px-3 py-2 rounded-lg border border-app-border bg-app text-app text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          {/* Token Amount + Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-app opacity-60 mb-1">Token Amount *</label>
              <input
                type="number"
                name="tokenAmount"
                value={form.tokenAmount}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g. 5000"
                className="w-full px-3 py-2 rounded-lg border border-app-border bg-app text-app text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-app opacity-60 mb-1">Price (VND) *</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g. 99000"
                className="w-full px-3 py-2 rounded-lg border border-app-border bg-app text-app text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          {/* Validity + Display Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-app opacity-60 mb-1">Validity (days) *</label>
              <input
                type="number"
                name="validityDays"
                value={form.validityDays}
                onChange={handleChange}
                required
                min="1"
                placeholder="e.g. 30"
                className="w-full px-3 py-2 rounded-lg border border-app-border bg-app text-app text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-app opacity-60 mb-1">Display Order *</label>
              <input
                type="number"
                name="displayOrder"
                value={form.displayOrder}
                onChange={handleChange}
                required
                min="0"
                placeholder="e.g. 1"
                className="w-full px-3 py-2 rounded-lg border border-app-border bg-app text-app text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-app opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {creating ? "Creating..." : "Create Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

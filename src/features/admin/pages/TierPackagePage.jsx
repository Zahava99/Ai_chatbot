import { useState, useEffect } from "react";
import { Package, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { getPackages } from "@/api/paymentApi";
import { formatPrice } from "@/hook/useFormatPrice";
import CreatePackageModal from "@/features/admin/components/CreatePackageModal";
import EditPackageModal from "@/features/admin/components/EditPackageModal";
import DeletePackageModal from "@/features/admin/components/DeletePackageModal";

export default function TierPackagePage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showCreate, setShowCreate] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [deletingPkg, setDeletingPkg] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    try {
      setLoading(true);
      const data = await getPackages();
      setPackages(data.sort((a, b) => a.displayOrder - b.displayOrder));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Package size={20} className="text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-app">Tier Packages</h1>
            <p className="text-sm text-app opacity-50">Manage subscription packages and pricing</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          <Plus size={16} />
          Add Package
        </button>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          Failed to load packages: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-xl border border-app-border bg-panel overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-app-border bg-black/[0.02] dark:bg-white/[0.02]">
                <th className="text-left px-4 py-3 font-medium text-app opacity-60">Order</th>
                <th className="text-left px-4 py-3 font-medium text-app opacity-60">Name</th>
                <th className="text-left px-4 py-3 font-medium text-app opacity-60">Price</th>
                <th className="text-left px-4 py-3 font-medium text-app opacity-60">Tokens</th>
                <th className="text-left px-4 py-3 font-medium text-app opacity-60">Validity</th>
                <th className="text-left px-4 py-3 font-medium text-app opacity-60">Status</th>
                <th className="text-left px-4 py-3 font-medium text-app opacity-60">Description</th>
                <th className="text-left px-4 py-3 font-medium text-app opacity-60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} className="border-b border-app-border last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-app opacity-70">{pkg.displayOrder}</td>
                  <td className="px-4 py-3 font-medium text-app">{pkg.name}</td>
                  <td className="px-4 py-3 text-app">{formatPrice(pkg.price)} VND</td>
                  <td className="px-4 py-3 text-app">{pkg.tokenAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-app">{pkg.validityDays} days</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        pkg.isActive
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {pkg.isActive ? (
                        <><ToggleRight size={12} /> Active</>
                      ) : (
                        <><ToggleLeft size={12} /> Inactive</>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-app opacity-60 max-w-[200px] truncate">{pkg.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingPkg(pkg)}
                        className="p-1.5 rounded-lg text-app opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                        title="Edit package"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingPkg(pkg)}
                        className="p-1.5 rounded-lg text-red-400 opacity-50 hover:opacity-100 hover:bg-red-500/10 transition-colors"
                        title="Delete package"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {packages.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-app opacity-40">
                    No packages found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <CreatePackageModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); fetchPackages(); }}
        />
      )}

      {editingPkg && (
        <EditPackageModal
          pkg={editingPkg}
          onClose={() => setEditingPkg(null)}
          onUpdated={() => { setEditingPkg(null); fetchPackages(); }}
        />
      )}

      {deletingPkg && (
        <DeletePackageModal
          pkg={deletingPkg}
          onClose={() => setDeletingPkg(null)}
          onDeleted={() => { setDeletingPkg(null); fetchPackages(); }}
        />
      )}
    </div>
  );
}

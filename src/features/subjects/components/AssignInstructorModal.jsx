import { useState, useEffect, useCallback } from "react";
import { X, Search, AlertCircle, Loader2, UserPlus, UserMinus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAdminUsers } from "@/features/admin/api/adminApi";
import { assignInstructor, unassignInstructor } from "@/api/subjectApi";
import useSubjectStore from "@/stores/useSubjectStore";

export default function AssignInstructorModal({ subjectId, onClose }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(null); // userId being assigned
  const [unassigning, setUnassigning] = useState(null); // userId being unassigned
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Get current instructors for this subject from the store
  const subject = useSubjectStore((s) => s.subjects.find((x) => String(x.id) === String(subjectId)));
  const assignedUserIds = new Set((subject?.instructors || []).map((i) => i.userId));

  const searchUsers = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminUsers({ page: 1, pageSize: 20, search: query });
      // Only show users with the "Lecturer" role
      const researchers = (data.items || []).filter((u) =>
        (u.roles || []).some((r) => r.toLowerCase() === "researcher")
      );
      setUsers(researchers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, searchUsers]);

  const handleAssign = async (user) => {
    setAssigning(user.id);
    setError(null);
    setSuccess(null);
    try {
      await assignInstructor(subjectId, user.id);
      await useSubjectStore.getState().refetchSubjects();
      setSuccess(`${user.fullName || user.email} assigned successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigning(null);
    }
  };

  const handleUnassign = async (user) => {
    setUnassigning(user.id);
    setError(null);
    setSuccess(null);
    try {
      await unassignInstructor(subjectId, user.id);
      await useSubjectStore.getState().refetchSubjects();
      setSuccess(`${user.fullName || user.email} unassigned successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUnassigning(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-panel border border-app-border rounded-2xl w-full max-w-md p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-app">Assign Instructor</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-app opacity-50 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-app-border bg-black/5 dark:bg-white/5 mb-4">
          <Search size={15} className="text-app opacity-40 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="flex-1 bg-transparent text-sm text-app placeholder:opacity-30 outline-none"
            autoFocus
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-3">
            <AlertCircle size={14} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-3">
            <CheckCircle2 size={14} className="shrink-0" />
            {success}
          </div>
        )}

        {/* User list */}
        <div className="max-h-64 overflow-y-auto divide-y divide-app-border rounded-xl border border-app-border">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={18} className="text-app opacity-40 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-8 text-center text-sm text-app opacity-30">
              {search ? "No users found." : "Type to search users…"}
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
                  {(user.fullName || user.email || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-app truncate">
                    {user.fullName || "Unnamed"}
                  </p>
                  <p className="text-xs text-app opacity-40 truncate">{user.email}</p>
                </div>
                <Button
                  onClick={() => handleAssign(user)}
                  disabled={assigning === user.id || unassigning === user.id || assignedUserIds.has(user.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* {assigning === user.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <UserPlus size={12} />
                  )} */}
                  Assign
                </Button>
                <Button
                  onClick={() => handleUnassign(user)}
                  disabled={assigning === user.id || unassigning === user.id || !assignedUserIds.has(user.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* {unassigning === user.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <UserMinus size={12} />
                  )} */}
                  Unassign
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-4">
          <Button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-app opacity-70 hover:opacity-100 bg-black/5 dark:bg-white/5"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

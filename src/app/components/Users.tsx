import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Copy,
  Loader2,
  Mail,
  Phone,
  Search,
  UserCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { usersApi } from "../../lib/api";
import type { UserProfile } from "../../lib/types";
import { themeColors, useTheme } from "./ThemeContext";

export function Users() {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [liveUsers, setLiveUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedStats, setSelectedStats] = useState<{ totalBookings: number; totalSpent: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getAll();
      if (response.success) setLiveUsers(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return liveUsers.filter((user) => {
      const fullName = user.full_name?.toLowerCase() || "";
      const email = user.email?.toLowerCase() || "";
      const phone = user.phone || "";
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase()) ||
        phone.includes(searchQuery);
      const matchesFilter =
        filterStatus === "All" ? true : filterStatus === "Active" ? true : false;

      return matchesSearch && matchesFilter;
    });
  }, [filterStatus, liveUsers, searchQuery]);

  const openActivity = async (user: UserProfile) => {
    setSelectedUser(user);
    setSelectedStats(null);
    setStatsLoading(true);

    try {
      const response = await usersApi.getStats(user.id);
      if (response.success) setSelectedStats(response.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load user activity");
    } finally {
      setStatsLoading(false);
    }
  };

  const copyEmail = async (email?: string) => {
    if (!email) {
      toast.error("This user does not have an email address");
      return;
    }

    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied to clipboard");
    } catch {
      toast.error("Failed to copy email");
    }
  };

  if (loading && liveUsers.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error && liveUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Users</h2>
        <p className="text-gray-500 mb-6 max-w-md">{error}</p>
        <button onClick={loadUsers} className={`px-6 py-2 ${colors.primary} text-white rounded-xl shadow-lg`}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500 mt-1">Review registered users and inspect account activity.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>All</option>
            <option>Active</option>
            <option>Blocked</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Total Registered Users", value: liveUsers.length },
          { label: "Active Users", value: liveUsers.length },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-indigo-200 bg-indigo-100 text-xl font-bold text-indigo-600">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                  ) : (
                    user.full_name?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">{user.full_name || "Anonymous User"}</h2>
                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{user.email || "No email"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{user.phone || "No phone"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Joined{" "}
                        {new Date(user.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                  ACTIVE
                </span>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => copyEmail(user.email)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4" />
                  Copy Email
                </button>
                <button
                  onClick={() => openActivity(user)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white ${colors.primary}`}
                >
                  <UserCheck className="h-4 w-4" />
                  View Activity
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center text-sm text-gray-500">
          No users found matching your search.
        </div>
      )}

      {selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-900">{selectedUser.full_name || "User Activity"}</h2>
              <button onClick={() => setSelectedUser(null)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Profile</p>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div>{selectedUser.email || "No email"}</div>
                  <div>{selectedUser.phone || "No phone"}</div>
                  <div>ID: {selectedUser.id}</div>
                </div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Activity</p>
                {statsLoading ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading stats...
                  </div>
                ) : (
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <div>Total Bookings: {selectedStats?.totalBookings || 0}</div>
                    <div>Total Spent: Rs. {(selectedStats?.totalSpent || 0).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Loader2,
  Phone,
  Plus,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { bookingsApi, listingsApi } from "../../lib/api";
import type { Booking, PGListing } from "../../lib/types";
import { themeColors, useTheme } from "./ThemeContext";

const statusConfig = {
  confirmed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
  completed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
};

const initialFormState = {
  listing_id: "",
  check_in: "",
  check_out: "",
  status: "pending",
  amount: "",
};

export function Bookings() {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [liveBookings, setLiveBookings] = useState<Booking[]>([]);
  const [availableListings, setAvailableListings] = useState<PGListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingsApi.getAll();
      if (response.success) setLiveBookings(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch bookings");
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const loadListings = async () => {
    try {
      const response = await listingsApi.getAll({ limit: 100 });
      if (response.success) setAvailableListings(response.data);
    } catch {
      toast.error("Failed to load listings for booking creation");
    }
  };

  useEffect(() => {
    loadBookings();
    loadListings();
  }, []);

  const filteredBookings = useMemo(() => {
    return liveBookings.filter((booking) => {
      const userName = booking.profiles?.full_name?.toLowerCase() || "";
      const propertyName = booking.pg_listings?.name?.toLowerCase() || "";
      const matchesSearch =
        booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userName.includes(searchQuery.toLowerCase()) ||
        propertyName.includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || booking.status === filterStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [filterStatus, liveBookings, searchQuery]);

  const handleCreateBooking = async () => {
    if (!formData.listing_id || !formData.check_in || !formData.check_out || !formData.amount) {
      toast.error("Complete all required booking fields");
      return;
    }

    if (new Date(formData.check_out) <= new Date(formData.check_in)) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    try {
      const response = await bookingsApi.create({
        listing_id: formData.listing_id,
        check_in: formData.check_in,
        check_out: formData.check_out,
        status: formData.status,
        amount: Number(formData.amount) || 0,
      });

      if (response.success) {
        toast.success("Booking created successfully");
        setShowAddModal(false);
        setFormData(initialFormState);
        await loadBookings();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create booking");
    }
  };

  if (loading && liveBookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error && liveBookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Bookings</h2>
        <p className="text-gray-500 mb-6 max-w-md">{error}</p>
        <button onClick={loadBookings} className={`px-6 py-2 ${colors.primary} text-white rounded-xl shadow-lg`}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 mt-1">Track every booking request and its lifecycle.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={`flex items-center gap-2 px-4 py-2 ${colors.primary} text-white rounded-xl shadow-lg text-sm`}
        >
          <Plus className="w-4 h-4" />
          Create Booking
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by booking ID, user, or property..."
              className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>All</option>
            <option>Pending</option>
            <option>Confirmed</option>
            <option>Cancelled</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings", value: liveBookings.length, icon: Calendar, color: "bg-blue-100 text-blue-600" },
          { label: "Confirmed", value: liveBookings.filter((item) => item.status === "confirmed").length, icon: CheckCircle, color: "bg-green-100 text-green-600" },
          { label: "Pending", value: liveBookings.filter((item) => item.status === "pending").length, icon: Clock, color: "bg-yellow-100 text-yellow-600" },
          { label: "Cancelled", value: liveBookings.filter((item) => item.status === "cancelled").length, icon: XCircle, color: "bg-red-100 text-red-600" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Booking ID", "User", "Property", "Dates", "Amount", "Status", "Actions"].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => {
                  const config =
                    statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending;
                  const StatusIcon = config.icon;

                  return (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{booking.id.slice(0, 8)}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{booking.profiles?.full_name || "Unknown User"}</div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="h-3 w-3" />
                          <span>{booking.profiles?.phone || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="font-medium text-gray-900">{booking.pg_listings?.name || "Deleted Property"}</div>
                        <div className="text-xs text-gray-500">{booking.pg_listings?.location || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>IN: {booking.check_in ? new Date(booking.check_in).toLocaleDateString() : "N/A"}</div>
                        <div>OUT: {booking.check_out ? new Date(booking.check_out).toLocaleDateString() : "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">Rs. {booking.amount?.toLocaleString() || "0"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {booking.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="rounded-lg border border-gray-200 p-2 text-indigo-600 hover:bg-indigo-50"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No bookings found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-900">Create Booking</h2>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <label className="md:col-span-2 block">
                <span className="mb-1 block text-xs font-semibold text-gray-600">Property *</span>
                <select
                  value={formData.listing_id}
                  onChange={(event) => setFormData({ ...formData, listing_id: event.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a property</option>
                  {availableListings.map((listing) => (
                    <option key={listing.id} value={listing.id}>
                      {listing.name} ({listing.location})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-gray-600">Check-In *</span>
                <input
                  type="date"
                  value={formData.check_in}
                  onChange={(event) => setFormData({ ...formData, check_in: event.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-gray-600">Check-Out *</span>
                <input
                  type="date"
                  value={formData.check_out}
                  onChange={(event) => setFormData({ ...formData, check_out: event.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-gray-600">Amount *</span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(event) => setFormData({ ...formData, amount: event.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="15000"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-gray-600">Initial Status</span>
                <select
                  value={formData.status}
                  onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
              <button onClick={() => setShowAddModal(false)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
                Cancel
              </button>
              <button onClick={handleCreateBooking} className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${colors.primary}`}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {selectedBooking ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-900">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Booking</p>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div>ID: {selectedBooking.id}</div>
                  <div>Status: {selectedBooking.status}</div>
                  <div>Amount: Rs. {selectedBooking.amount?.toLocaleString() || "0"}</div>
                </div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Dates</p>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div>Check-In: {selectedBooking.check_in ? new Date(selectedBooking.check_in).toLocaleDateString() : "N/A"}</div>
                  <div>Check-Out: {selectedBooking.check_out ? new Date(selectedBooking.check_out).toLocaleDateString() : "N/A"}</div>
                  <div>Created: {selectedBooking.created_at ? new Date(selectedBooking.created_at).toLocaleDateString() : "N/A"}</div>
                </div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Guest</p>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div>{selectedBooking.profiles?.full_name || "Unknown User"}</div>
                  <div>{selectedBooking.profiles?.phone || "No phone available"}</div>
                </div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Property</p>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div>{selectedBooking.pg_listings?.name || "Deleted Property"}</div>
                  <div>{selectedBooking.pg_listings?.location || "No location available"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

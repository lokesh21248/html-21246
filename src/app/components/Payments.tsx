import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Loader2,
  Search,
  TrendingUp,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { paymentsApi } from "../../lib/api";
import type { Payment } from "../../lib/types";
import { themeColors, useTheme } from "./ThemeContext";

const statusConfig = {
  completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  failed: { color: "bg-red-100 text-red-800", icon: XCircle },
  refunded: { color: "bg-gray-100 text-gray-800", icon: XCircle },
};

export function Payments() {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [livePayments, setLivePayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentsApi.getAll();
      if (response.success) setLivePayments(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch payments");
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return livePayments.filter((payment) => {
      const userName = payment.profiles?.full_name?.toLowerCase() || "";
      const bookingId = payment.booking_id?.toLowerCase() || "";
      const matchesSearch =
        payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userName.includes(searchQuery.toLowerCase()) ||
        bookingId.includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || payment.status === filterStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [filterStatus, livePayments, searchQuery]);

  const totalRevenue = livePayments
    .filter((payment) => payment.status === "completed")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingAmount = livePayments
    .filter((payment) => payment.status === "pending")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const handleExportCsv = () => {
    if (filteredPayments.length === 0) {
      toast.error("There are no payments to export");
      return;
    }

    const rows = [
      ["payment_id", "user_name", "booking_id", "amount", "status", "created_at"],
      ...filteredPayments.map((payment) => [
        payment.id,
        payment.profiles?.full_name || "",
        payment.booking_id || "",
        String(payment.amount),
        payment.status,
        payment.created_at,
      ]),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "payments-export.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("CSV export generated");
  };

  if (loading && livePayments.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error && livePayments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Payments</h2>
        <p className="text-gray-500 mb-6 max-w-md">{error}</p>
        <button onClick={loadPayments} className={`px-6 py-2 ${colors.primary} text-white rounded-xl shadow-lg`}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">Track revenue, payment states, and booking-linked transactions.</p>
        </div>
        <button
          onClick={handleExportCsv}
          className={`flex items-center gap-2 px-4 py-2 ${colors.primary} text-white rounded-xl shadow-lg`}
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold">Rs. {totalRevenue.toLocaleString()}</p>
              <div className="mt-3 flex items-center gap-1 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>Validated</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <CheckCircle className="h-7 w-7" />
            </div>
          </div>
        </div>
        {[
          { label: "Successful", value: livePayments.filter((item) => item.status === "completed").length, note: "", color: "bg-green-100 text-green-600", icon: CheckCircle },
          { label: "Pending", value: livePayments.filter((item) => item.status === "pending").length, note: `Rs. ${pendingAmount.toLocaleString()} volume`, color: "bg-yellow-100 text-yellow-600", icon: Clock },
          { label: "Failed", value: livePayments.filter((item) => item.status === "failed").length, note: "", color: "bg-red-100 text-red-600", icon: XCircle },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
                  {card.note ? <p className="mt-1 text-xs text-gray-500">{card.note}</p> : null}
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by payment ID, user, or booking ID..."
              className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Payment ID", "User", "Booking ID", "Amount", "Date", "Status", "Actions"].map((heading) => (
                  <th key={heading} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => {
                  const config =
                    statusConfig[payment.status as keyof typeof statusConfig] || statusConfig.pending;
                  const StatusIcon = config.icon;

                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">{payment.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.profiles?.full_name || "Unknown User"}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{payment.booking_id?.slice(0, 8) || "N/A"}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">Rs. {payment.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(payment.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="rounded-lg border border-gray-200 p-2 text-indigo-600 hover:bg-indigo-50"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPayment ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-lg font-bold text-gray-900">Payment Details</h2>
              <button onClick={() => setSelectedPayment(null)} className="rounded-lg p-2 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2">
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Transaction</p>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div>ID: {selectedPayment.id}</div>
                  <div>Status: {selectedPayment.status}</div>
                  <div>Amount: Rs. {selectedPayment.amount.toLocaleString()}</div>
                </div>
              </div>
              <div className="rounded-2xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">Linked Records</p>
                <div className="mt-3 space-y-2 text-sm text-gray-700">
                  <div>User: {selectedPayment.profiles?.full_name || "Unknown User"}</div>
                  <div>Booking ID: {selectedPayment.booking_id || "N/A"}</div>
                  <div>Date: {new Date(selectedPayment.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

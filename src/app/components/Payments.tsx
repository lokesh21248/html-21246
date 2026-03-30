import { useState } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  Clock, 
  XCircle,
  ArrowUpRight,
  TrendingUp
} from "lucide-react";

// Dummy data
const payments = [
  {
    id: "PAY001",
    user: "Rahul Sharma",
    pg: "Green Valley PG",
    amount: 144000,
    date: "2026-03-20",
    method: "UPI",
    transactionId: "UPI2026032012345",
    status: "Success",
  },
  {
    id: "PAY002",
    user: "Priya Patel",
    pg: "Sunrise Heights",
    amount: 93000,
    date: "2026-03-24",
    method: "Credit Card",
    transactionId: "CC2026032487654",
    status: "Pending",
  },
  {
    id: "PAY003",
    user: "Amit Kumar",
    pg: "City Center PG",
    amount: 63000,
    date: "2026-03-15",
    method: "Net Banking",
    transactionId: "NB2026031534567",
    status: "Success",
  },
  {
    id: "PAY004",
    user: "Sneha Singh",
    pg: "Comfort Inn",
    amount: 156000,
    date: "2026-03-22",
    method: "Debit Card",
    transactionId: "DC2026032298765",
    status: "Success",
  },
  {
    id: "PAY005",
    user: "Vikram Reddy",
    pg: "Student Haven",
    amount: 33000,
    date: "2026-03-18",
    method: "UPI",
    transactionId: "UPI2026031856789",
    status: "Failed",
  },
  {
    id: "PAY006",
    user: "Ananya Iyer",
    pg: "Sunrise Heights",
    amount: 93000,
    date: "2026-03-26",
    method: "Credit Card",
    transactionId: "CC2026032623456",
    status: "Pending",
  },
  {
    id: "PAY007",
    user: "Rohan Mehta",
    pg: "Green Valley PG",
    amount: 144000,
    date: "2026-03-27",
    method: "UPI",
    transactionId: "UPI2026032765432",
    status: "Success",
  },
  {
    id: "PAY008",
    user: "Kavya Nair",
    pg: "City Center PG",
    amount: 63000,
    date: "2026-03-25",
    method: "Net Banking",
    transactionId: "NB2026032554321",
    status: "Success",
  },
];

const statusConfig = {
  Success: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  Pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  Failed: { color: "bg-red-100 text-red-800", icon: XCircle },
};

export function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || payment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalRevenue = payments
    .filter((p) => p.status === "Success")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments
    .filter((p) => p.status === "Pending")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 mt-1">Track and manage all payment transactions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">₹{totalRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-3">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">+18.2% from last month</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-7 h-7" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Successful</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {payments.filter((p) => p.status === "Success").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {payments.filter((p) => p.status === "Pending").length}
              </p>
              <p className="text-xs text-gray-500 mt-1">₹{pendingAmount.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Failed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {payments.filter((p) => p.status === "Failed").length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by payment ID, user, or transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option>All</option>
              <option>Success</option>
              <option>Pending</option>
              <option>Failed</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PG Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => {
                const StatusIcon = statusConfig[payment.status as keyof typeof statusConfig].icon;
                return (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{payment.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-indigo-700">
                            {payment.user.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">{payment.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{payment.pg}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{payment.method}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 font-mono">{payment.transactionId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{payment.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${
                          statusConfig[payment.status as keyof typeof statusConfig].color
                        }`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Search, Calendar, Eye, CheckCircle, Clock, XCircle } from "lucide-react";

// Dummy data
const bookings = [
  {
    id: "BK001",
    user: "Rahul Sharma",
    email: "rahul.sharma@email.com",
    pg: "Green Valley PG",
    checkIn: "2026-04-01",
    checkOut: "2027-03-31",
    duration: "12 months",
    amount: 144000,
    status: "Confirmed",
    bookingDate: "2026-03-20",
  },
  {
    id: "BK002",
    user: "Priya Patel",
    email: "priya.patel@email.com",
    pg: "Sunrise Heights",
    checkIn: "2026-04-05",
    checkOut: "2026-10-05",
    duration: "6 months",
    amount: 93000,
    status: "Pending",
    bookingDate: "2026-03-24",
  },
  {
    id: "BK003",
    user: "Amit Kumar",
    email: "amit.kumar@email.com",
    pg: "City Center PG",
    checkIn: "2026-03-25",
    checkOut: "2026-09-25",
    duration: "6 months",
    amount: 63000,
    status: "Confirmed",
    bookingDate: "2026-03-15",
  },
  {
    id: "BK004",
    user: "Sneha Singh",
    email: "sneha.singh@email.com",
    pg: "Comfort Inn",
    checkIn: "2026-04-10",
    checkOut: "2027-04-10",
    duration: "12 months",
    amount: 156000,
    status: "Confirmed",
    bookingDate: "2026-03-22",
  },
  {
    id: "BK005",
    user: "Vikram Reddy",
    email: "vikram.reddy@email.com",
    pg: "Student Haven",
    checkIn: "2026-04-01",
    checkOut: "2026-07-01",
    duration: "3 months",
    amount: 33000,
    status: "Cancelled",
    bookingDate: "2026-03-18",
  },
  {
    id: "BK006",
    user: "Ananya Iyer",
    email: "ananya.iyer@email.com",
    pg: "Sunrise Heights",
    checkIn: "2026-04-15",
    checkOut: "2026-10-15",
    duration: "6 months",
    amount: 93000,
    status: "Pending",
    bookingDate: "2026-03-26",
  },
  {
    id: "BK007",
    user: "Rohan Mehta",
    email: "rohan.mehta@email.com",
    pg: "Green Valley PG",
    checkIn: "2026-05-01",
    checkOut: "2027-05-01",
    duration: "12 months",
    amount: 144000,
    status: "Confirmed",
    bookingDate: "2026-03-27",
  },
];

const statusConfig = {
  Confirmed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  Pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  Cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
};

export function Bookings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.pg.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || booking.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500 mt-1">Manage and track all booking requests</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by booking ID, user, or PG..."
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
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>

          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter((b) => b.status === "Confirmed").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter((b) => b.status === "Pending").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter((b) => b.status === "Cancelled").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PG Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-In / Check-Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
              {filteredBookings.map((booking) => {
                const StatusIcon = statusConfig[booking.status as keyof typeof statusConfig].icon;
                return (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{booking.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.user}</div>
                        <div className="text-sm text-gray-500">{booking.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{booking.pg}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-900">{booking.checkIn}</div>
                        <div className="text-gray-500">{booking.checkOut}</div>
                        <div className="text-xs text-gray-400">{booking.duration}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{booking.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full ${
                          statusConfig[booking.status as keyof typeof statusConfig].color
                        }`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
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

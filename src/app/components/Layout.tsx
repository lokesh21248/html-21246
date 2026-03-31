import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  Search,
  Settings,
  User,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { themeColors, useTheme } from "./ThemeContext";

const menuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/pgs", label: "PG Listings", icon: Building2 },
  { path: "/bookings", label: "Bookings", icon: Calendar },
  { path: "/users", label: "Users", icon: UsersIcon },
  { path: "/payments", label: "Payments", icon: CreditCard },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const colors = themeColors[theme];

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");

  useEffect(() => {
    setShowNotifications(false);
    setShowThemeMenu(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const displayName = user?.full_name || "Admin User";
  const displayEmail = user?.email || "admin@pgbooking.com";
  const initials = displayName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const notifications = [
    { id: 1, text: "New booking received from Rahul Sharma", time: "5 min ago", unread: true },
    { id: 2, text: "Payment confirmed for BK001", time: "1 hour ago", unread: true },
    { id: 3, text: "New user registration", time: "2 hours ago", unread: false },
  ];

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/login", { replace: true });
  };

  const handleQuickSearch = () => {
    const query = quickSearch.trim().toLowerCase();

    if (!query) {
      return;
    }

    const match = menuItems.find((item) => item.label.toLowerCase().includes(query));

    if (!match) {
      toast.error("No matching page found");
      return;
    }

    navigate(match.path);
    setQuickSearch("");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-0"
        } bg-gradient-to-b ${colors.gradient} text-white transition-all duration-300 ease-in-out overflow-hidden flex flex-col shadow-xl`}
      >
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-lg">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">PG Admin</h1>
              <p className="text-xs text-white/70">Management Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-white text-gray-900 shadow-lg"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-3 px-3 py-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center shadow-md">
              <span className="font-bold text-sm">{initials || "AD"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{displayName}</p>
              <p className="text-xs text-white/70 truncate">{displayEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen((value) => !value)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>

            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={quickSearch}
                onChange={(event) => setQuickSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleQuickSearch();
                  }
                }}
                placeholder="Jump to dashboard, bookings, users..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current w-80 transition-all"
                style={{
                  color:
                    theme === "blue"
                      ? "#2563eb"
                      : theme === "purple"
                      ? "#9333ea"
                      : "#059669",
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu((value) => !value)}
                className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Palette className="w-5 h-5 text-gray-600" />
              </button>

              {showThemeMenu ? (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowThemeMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20">
                    <div className="px-3 py-2 border-b border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Choose Theme</p>
                    </div>
                    <button
                      onClick={() => {
                        setTheme("blue");
                        setShowThemeMenu(false);
                      }}
                      className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-md" />
                      <span className="text-sm font-medium text-gray-700">Ocean Blue</span>
                      {theme === "blue" ? (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                      ) : null}
                    </button>
                    <button
                      onClick={() => {
                        setTheme("purple");
                        setShowThemeMenu(false);
                      }}
                      className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg shadow-md" />
                      <span className="text-sm font-medium text-gray-700">Royal Purple</span>
                      {theme === "purple" ? (
                        <div className="ml-auto w-2 h-2 bg-purple-600 rounded-full" />
                      ) : null}
                    </button>
                    <button
                      onClick={() => {
                        setTheme("green");
                        setShowThemeMenu(false);
                      }}
                      className="w-full px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-lg shadow-md" />
                      <span className="text-sm font-medium text-gray-700">Fresh Green</span>
                      {theme === "green" ? (
                        <div className="ml-auto w-2 h-2 bg-emerald-600 rounded-full" />
                      ) : null}
                    </button>
                  </div>
                </>
              ) : null}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowNotifications((value) => !value)}
                className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>

              {showNotifications ? (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                      <p className="font-semibold text-gray-900">Notifications</p>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-semibold">
                        {notifications.filter((item) => item.unread).length} New
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                            notification.unread ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <p className="text-sm text-gray-900">{notification.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3 border-t border-gray-200 text-center">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate("/bookings");
                        }}
                        className={`text-sm font-medium ${colors.primaryText} hover:underline`}
                      >
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu((value) => !value)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-xl cursor-pointer transition-colors"
              >
                <div className={`w-9 h-9 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center shadow-md`}>
                  <span className="text-white text-sm font-bold">{initials || "AD"}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {showUserMenu ? (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-500 mt-1">{displayEmail}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/users");
                      }}
                      className="w-full px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowThemeMenu(true);
                      }}
                      className="w-full px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-gray-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Theme Settings</span>
                    </button>
                    <div className="border-t border-gray-200 my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 hover:bg-red-50 flex items-center gap-3 text-red-600 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { Building2, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nextPath = (location.state as { from?: string } | null)?.from || "/";

  if (isAuthenticated && !isLoading) {
    return <Navigate to={nextPath} replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error("Enter both email and password");
      return;
    }

    setSubmitting(true);

    try {
      await login(email.trim(), password);
      toast.success("Welcome back");
      navigate(nextPath, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_45%,_#ffffff_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur md:grid-cols-[1.15fr_0.85fr]">
          <div className="hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-10 text-white md:block">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Building2 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">PG Admin</h1>
                <p className="text-sm text-blue-100/80">Production control center</p>
              </div>
            </div>

            <div className="mt-16 space-y-5">
              <h2 className="max-w-sm text-4xl font-semibold leading-tight">
                Secure access for your bookings, listings, users, and payments.
              </h2>
              <p className="max-w-md text-sm leading-6 text-blue-100/80">
                Sign in with an admin account to manage inventory, monitor revenue,
                review bookings, and keep the deployed SaaS platform healthy.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mx-auto max-w-md">
              <div className="mb-8 md:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">PG Admin</h1>
                    <p className="text-sm text-gray-500">Production control center</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Admin Login
                </p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">Sign in to continue</h2>
                <p className="mt-2 text-sm text-gray-500">
                  Only admin-role Supabase users can access this panel.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Email</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="admin@yourcompany.com"
                      className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Password</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-blue-500 focus-within:bg-white">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {submitting ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

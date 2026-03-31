import { Suspense, lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { Login } from "./components/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";

const Dashboard = lazy(() =>
  import("./components/Dashboard").then((module) => ({ default: module.Dashboard }))
);
const PGListings = lazy(() =>
  import("./components/PGListings").then((module) => ({ default: module.PGListings }))
);
const Bookings = lazy(() =>
  import("./components/Bookings").then((module) => ({ default: module.Bookings }))
);
const Users = lazy(() =>
  import("./components/Users").then((module) => ({ default: module.Users }))
);
const Payments = lazy(() =>
  import("./components/Payments").then((module) => ({ default: module.Payments }))
);

function RouteLoader() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-sm">
        <p className="text-sm font-medium text-gray-600">Loading page...</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<RouteLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "pgs",
        element: (
          <Suspense fallback={<RouteLoader />}>
            <PGListings />
          </Suspense>
        ),
      },
      {
        path: "bookings",
        element: (
          <Suspense fallback={<RouteLoader />}>
            <Bookings />
          </Suspense>
        ),
      },
      {
        path: "users",
        element: (
          <Suspense fallback={<RouteLoader />}>
            <Users />
          </Suspense>
        ),
      },
      {
        path: "payments",
        element: (
          <Suspense fallback={<RouteLoader />}>
            <Payments />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

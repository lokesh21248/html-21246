import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { PGListings } from "./components/PGListings";
import { Bookings } from "./components/Bookings";
import { Users } from "./components/Users";
import { Payments } from "./components/Payments";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "pgs", Component: PGListings },
      { path: "bookings", Component: Bookings },
      { path: "users", Component: Users },
      { path: "payments", Component: Payments },
    ],
  },
]);

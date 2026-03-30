import { redirect } from "next/navigation";

/**
 * Root page — redirects to the admin dashboard.
 * Add authentication guard here before going to production.
 */
export default function RootPage() {
  redirect("/dashboard");
}


import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function DashboardIndex() {
  // After Airbnb-style refactor, /dashboard is just an entry point;
  // the meaningful landing is "Trips" (= bookings).
  redirect("/dashboard/bookings");
}

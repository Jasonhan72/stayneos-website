import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Bookings | NEOS",
  description: "View and manage your bookings at NEOS",
};

// Booking page - redirects to account/bookings
export default function BookingPage() {
  redirect("/account/bookings");
}

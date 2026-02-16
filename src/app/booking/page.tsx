import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Bookings | StayNeos",
  description: "View and manage your bookings at StayNeos",
};

// Booking page - redirects to account/bookings
export default function BookingPage() {
  redirect("/account/bookings");
}

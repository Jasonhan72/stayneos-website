import { redirect } from "next/navigation";

export default function AccountIndexPage() {
  // Airbnb convention: /account lands on Personal info
  redirect("/account/personal-info");
}

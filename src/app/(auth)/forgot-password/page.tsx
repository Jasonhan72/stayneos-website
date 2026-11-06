import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("forgot-password");
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

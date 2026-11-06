import { localizedPageMetadata } from "@/lib/i18n-server";
import { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export async function generateMetadata(): Promise<Metadata> {
  return localizedPageMetadata("reset-password");
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return <ResetPasswordForm initialToken={resolvedSearchParams?.token || ""} />;
}

import { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password - NEOS",
  description: "Set your new password",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return <ResetPasswordForm initialToken={resolvedSearchParams?.token || ""} />;
}

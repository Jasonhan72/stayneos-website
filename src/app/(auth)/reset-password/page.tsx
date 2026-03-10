import { Metadata } from "next";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password - StayNeos",
  description: "Set your new password",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}

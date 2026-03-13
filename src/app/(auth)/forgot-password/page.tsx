import { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password - NEOS",
  description: "Reset your NEOS account password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

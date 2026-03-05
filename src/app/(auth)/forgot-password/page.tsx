import { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password - StayNeos",
  description: "Reset your StayNeos account password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

import { Metadata } from "next";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "忘记密码 - StayNeos",
  description: "重置您的 StayNeos 账号密码",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}

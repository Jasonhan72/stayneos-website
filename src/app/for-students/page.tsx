import { Metadata } from "next";
import ForStudentsPageContent from "./ForStudentsPageContent";

export const metadata: Metadata = {
  title: "Furnished Housing for Visiting Scholars & Medical Professionals | Toronto | StayNeos",
  description: "Premium furnished apartments near UofT, Toronto General, Mt. Sinai, SickKids. Ideal for visiting academics, medical fellows, and conference attendees.",
};

export default function ForStudentsPage() {
  return <ForStudentsPageContent />;
}

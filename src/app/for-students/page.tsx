import { Metadata } from "next";
import ForStudentsPageContent from "./ForStudentsPageContent";

export const metadata: Metadata = {
  title: "Academic & Medical Professionals Housing | StayNeos",
  description: "Premium furnished apartments for visiting scholars, medical fellows/residents, parents of international students, and conference participants in downtown Toronto.",
};

export default function ForStudentsPage() {
  return <ForStudentsPageContent />;
}
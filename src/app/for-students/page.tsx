import { Metadata } from "next";
import ForStudentsPageContent from "./ForStudentsPageContent";

export const metadata: Metadata = {
  title: "Student Housing Toronto | StayNeos for Students",
  description: "Premium student housing near University of Toronto, Ryerson, and other Toronto campuses. Fully furnished apartments, flexible leases, and vibrant student community.",
};

export default function ForStudentsPage() {
  return <ForStudentsPageContent />;
}
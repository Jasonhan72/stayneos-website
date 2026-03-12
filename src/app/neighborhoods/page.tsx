import { Metadata } from "next";
import NeighborhoodsPageContent from "./NeighborhoodsPageContent";

export const metadata: Metadata = {
  title: "Toronto Neighborhoods Guide | StayNeos",
  description: "Real neighborhood guide focused on Waterfront/Sugar Wharf, Downtown Core/Grange Park, and North York/Yonge-Sheppard.",
};

export default function NeighborhoodsPage() {
  return <NeighborhoodsPageContent />;
}
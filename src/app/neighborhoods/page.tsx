import { Metadata } from "next";
import NeighborhoodsPageContent from "./NeighborhoodsPageContent";

export const metadata: Metadata = {
  title: "Toronto Neighborhoods Guide | Waterfront, Downtown Core, North York | NEOS",
  description: "Explore Toronto's premium neighborhoods where NEOS properties are located. Sugar Wharf waterfront, downtown hospital district, and North York.",
};

export default function NeighborhoodsPage() {
  return <NeighborhoodsPageContent />;
}

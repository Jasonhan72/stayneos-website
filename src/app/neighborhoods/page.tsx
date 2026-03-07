import { Metadata } from "next";
import NeighborhoodsPageContent from "./NeighborhoodsPageContent";

export const metadata: Metadata = {
  title: "Toronto Neighborhoods Guide | StayNeos",
  description: "Discover Toronto's best neighborhoods for executive living. Detailed guides to Downtown, Midtown, North York, Yorkville, Liberty Village and more with transit, amenities, and pricing info.",
};

export default function NeighborhoodsPage() {
  return <NeighborhoodsPageContent />;
}
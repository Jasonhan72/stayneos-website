import { Metadata } from "next";
import MarketPostPage from "./MarketPostPage";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())} | NEOS Market Insights`,
    description: "Toronto real estate market analysis and insights from NEOS Research.",
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  return <MarketPostPage slug={slug} />;
}

import { Metadata } from "next";
import ContactPageContent from "./ContactPageContent";

export const metadata: Metadata = {
  title: "联系我们 | StayNeos",
  description: "联系 StayNeos 团队，获取高端行政公寓租赁咨询。我们的专业团队随时为您提供帮助，解答您的任何问题。",
  keywords: ["联系我们", "StayNeos", "公寓咨询", "多伦多租房", "客户服务"],
  openGraph: {
    title: "联系我们 | StayNeos",
    description: "联系 StayNeos 团队，获取高端行政公寓租赁咨询",
    type: "website",
    locale: "zh_CN",
  },
};

export default function ContactPage() {
  return <ContactPageContent />;
}

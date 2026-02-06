import { Metadata } from "next";
import { Phone } from "lucide-react";
import { Container, Section } from "@/components/ui";
import { 
  ContactForm, 
  ContactInfoCard, 
  SocialLinks, 
  FAQQuickLinks, 
  MapSection 
} from "./components";

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
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 页面标题 */}
      <div className="bg-primary py-16 md:py-24">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              联系我们
            </h1>
            <p className="text-lg text-primary-100">
              无论您有任何问题或需求，我们的团队随时准备为您提供帮助。
              <br className="hidden md:block" />
              请通过以下方式与我们取得联系。
            </p>
          </div>
        </Container>
      </div>

      {/* 主要内容区域 */}
      <Section bg="neutral">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* 左侧：联系信息 */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                  联系方式
                </h2>
                <ContactInfoCard />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SocialLinks />
                <FAQQuickLinks />
              </div>
            </div>

            {/* 右侧：联系表单 */}
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                发送消息
              </h2>
              <ContactForm />
            </div>
          </div>
        </Container>
      </Section>

      {/* 地图区域 */}
      <section className="w-full">
        <MapSection />
      </section>

      {/* 紧急联系 CTA */}
      <Section bg="white">
        <Container>
          <div className="bg-primary p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              需要紧急帮助？
            </h2>
            <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
              如果您是已入住的租客，遇到紧急情况需要立即协助，请拨打我们的 24 小时紧急热线
            </p>
            <a 
              href="tel:+14165550123"
              className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-primary font-semibold text-lg hover:bg-accent-600 transition-colors"
            >
              <Phone className="w-6 h-6" />
              +1 (416) 555-0123
            </a>
          </div>
        </Container>
      </Section>
    </div>
  );
}

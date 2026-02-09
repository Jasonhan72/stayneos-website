"use client";

import { Container, Section } from "@/components/ui";
import { Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { 
  ContactForm, 
  ContactInfoCard, 
  SocialLinks, 
  FAQQuickLinks, 
  MapSection 
} from "./components";

export default function ContactPageContent() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 页面标题 */}
      <div className="bg-primary py-16 md:py-24">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              {t("contact.pageTitle")}
            </h1>
            <p className="text-lg text-primary-100">
              {t("contact.pageSubtitle")}
            </p>
          </div>
        </Container>
      </div>

      {/* 主要内容区域 */}
      <Section className="bg-neutral-50">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* 左侧：联系信息 */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">
                  {t("contact.infoTitle")}
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
                {t("contact.formTitle")}
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
      <Section className="bg-white">
        <Container>
          <div className="bg-primary p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {t("contact.emergency.title")}
            </h2>
            <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
              {t("contact.emergency.desc")}
            </p>
            <a 
              href="tel:+16478626518"
              className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-primary font-semibold text-lg hover:bg-accent-600 transition-colors"
            >
              <Phone className="w-6 h-6" />
              +1 (647) 862-6518
            </a>
          </div>
        </Container>
      </Section>
    </div>
  );
}

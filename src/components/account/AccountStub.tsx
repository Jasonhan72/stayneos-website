"use client";

import { Wrench } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function AccountStub({
  titleZh,
  titleEn,
  titleFr,
}: {
  titleZh: string;
  titleEn: string;
  titleFr: string;
}) {
  const { locale } = useI18n();
  const title = locale === "zh" ? titleZh : locale === "fr" ? titleFr : titleEn;
  const msg =
    locale === "zh"
      ? "这个模块正在开发中，很快就能用。"
      : locale === "fr"
      ? "Cette section arrive bientôt."
      : "This section is coming soon.";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-neutral-900">{title}</h2>
      </div>
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center">
        <Wrench className="mx-auto mb-3 w-6 h-6 text-neutral-400" />
        <p className="text-sm text-neutral-600">{msg}</p>
      </div>
    </div>
  );
}

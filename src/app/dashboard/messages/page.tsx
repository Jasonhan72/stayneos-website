"use client";

import { MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default function MessagesPage() {
  const { locale } = useI18n();
  const L = (z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 mb-8">
          {L("消息", "Messages", "Messages")}
        </h1>
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-12 text-center">
          <MessageCircle className="mx-auto mb-3 w-6 h-6 text-neutral-400" />
          <p className="text-sm text-neutral-600">
            {L(
              "消息功能即将上线。有问题请通过 WhatsApp 或邮箱联系我们。",
              "Messaging is coming soon. Reach us on WhatsApp or email in the meantime.",
              "La messagerie arrive bientôt. Contactez-nous par WhatsApp ou e-mail."
            )}
          </p>
        </div>
      </div>
    </main>
  );
}

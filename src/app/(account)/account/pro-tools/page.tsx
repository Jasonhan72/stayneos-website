"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import {
  BarChart3,
  Calendar,
  MessageSquare,
  Megaphone,
  TrendingUp,
  ArrowRight,
  Lock,
} from "lucide-react";

const TOOLS = [
  {
    icon: <BarChart3 className="w-5 h-5" />,
    titleEn: "Dashboard",
    titleZh: "数据仪表盘",
    titleFr: "Tableau de bord",
    descEn: "Booking analytics and performance metrics.",
    descZh: "预订分析与性能指标。",
    descFr: "Analytiques et indicateurs de performance.",
    href: "/host",
    hostOnly: true,
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    titleEn: "Calendar",
    titleZh: "日历管理",
    titleFr: "Calendrier",
    descEn: "Manage availability and block dates.",
    descZh: "管理可订状态和锁定日期。",
    descFr: "Gérez les disponibilités et les blocages.",
    href: "/host/calendar",
    hostOnly: true,
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    titleEn: "Messaging",
    titleZh: "消息中心",
    titleFr: "Messagerie",
    descEn: "Communicate with guests and NEOS support.",
    descZh: "与房客及 NEOS 客服沟通。",
    descFr: "Communiquez avec les voyageurs et le support NEOS.",
    href: "/dashboard/messages",
    hostOnly: false,
  },
  {
    icon: <Megaphone className="w-5 h-5" />,
    titleEn: "Market Insights",
    titleZh: "市场洞察",
    titleFr: "Aperçu du marché",
    descEn: "Toronto rental data, trends, and analysis.",
    descZh: "多伦多租房数据、趋势与分析。",
    descFr: "Données et analyses du marché locatif de Toronto.",
    href: "/market-insights",
    hostOnly: false,
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    titleEn: "Host earnings",
    titleZh: "收益报告",
    titleFr: "Revenus hôtes",
    descEn: "See revenue breakdown by property and month.",
    descZh: "按房源和月份查看收入详情。",
    descFr: "Consultez les revenus par propriété et par mois.",
    href: "/host/earnings",
    hostOnly: true,
  },
];

export default function ProToolsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { locale } = useI18n();
  const L = (z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e;

  if (isLoading) {
    return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  }

  const isHost = isAuthenticated && user?.role === "HOST";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">
          {L("专业工具", "Pro tools", "Outils professionnels")}
        </h2>
      </div>

      <div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
        {TOOLS.map((tool) => {
          const locked = tool.hostOnly && !isHost;
          return (
            <Link
              key={tool.href}
              href={locked ? "/become-a-host" : tool.href}
              className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                locked ? "opacity-60 hover:opacity-80" : "hover:bg-neutral-50"
              }`}
            >
              <span className="mt-0.5 text-neutral-600 shrink-0">
                {locked ? <Lock className="w-5 h-5" /> : tool.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-neutral-900">
                  {L(tool.titleZh, tool.titleEn, tool.titleFr)}
                </div>
                <div className="mt-0.5 text-sm text-neutral-500">
                  {L(tool.descZh, tool.descEn, tool.descFr)}
                </div>
              </div>
              {locked && (
                <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  {L("房东专属", "Host only", "Hôtes uniquement")}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {!isHost && (
        <div className="rounded-2xl border border-neutral-200 p-5">
          <p className="text-sm text-neutral-600">
            {L(
              "部分工具仅限房东使用。成为房东解锁所有专业工具。",
              "Some tools are for hosts only. Become a host to unlock all pro tools.",
              "Certains outils sont réservés aux hôtes. Devenez hôte pour tout débloquer."
            )}
          </p>
          <Link
            href="/become-a-host"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 underline underline-offset-4"
          >
            {L("成为房东", "Become a host", "Devenir hôte")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

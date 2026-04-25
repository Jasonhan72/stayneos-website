"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Palette, Layout, MessageSquare } from "lucide-react";

export default function PersonalizationPage() {
  const { locale } = useI18n();
  const L = (z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e;

  const [dateFormat, setDateFormat] = useState("MMM D, YYYY");
  const [firstDayOfWeek, setFirstDayOfWeek] = useState("monday");
  const [messageSort, setMessageSort] = useState("newest");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">
          {L("个性化设置", "Personalization", "Personnalisation")}
        </h2>
      </div>

      <div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
        <SelectRow
          icon={<Layout className="w-5 h-5" />}
          label={L("日期格式", "Date format", "Format de date")}
          value={dateFormat}
          onChange={setDateFormat}
          options={[
            { value: "MMM D, YYYY", label: "Jan 5, 2026" },
            { value: "D MMM YYYY", label: "5 Jan 2026" },
            { value: "YYYY-MM-DD", label: "2026-01-05" },
            { value: "DD/MM/YYYY", label: "05/01/2026" },
          ]}
        />
        <SelectRow
          icon={<Palette className="w-5 h-5" />}
          label={L("每周起始日", "First day of week", "Premier jour de la semaine")}
          value={firstDayOfWeek}
          onChange={setFirstDayOfWeek}
          options={[
            { value: "monday", label: L("周一", "Monday", "Lundi") },
            { value: "sunday", label: L("周日", "Sunday", "Dimanche") },
          ]}
        />
        <SelectRow
          icon={<MessageSquare className="w-5 h-5" />}
          label={L("消息排序", "Message sort order", "Tri des messages")}
          value={messageSort}
          onChange={setMessageSort}
          options={[
            { value: "newest", label: L("最新在前", "Newest first", "Plus récents d'abord") },
            { value: "oldest", label: L("最早在前", "Oldest first", "Plus anciens d'abord") },
          ]}
        />
      </div>
    </div>
  );
}

function SelectRow({
  icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="text-neutral-600">{icon}</span>
        <span className="text-sm font-medium text-neutral-900">{label}</span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

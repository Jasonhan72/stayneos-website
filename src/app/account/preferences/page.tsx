"use client";

import { useCallback, useState } from "react";
import { useI18n } from "@/lib/i18n";
import {
  Globe,
  Moon,
  DollarSign,
  Ruler,
  Thermometer,
} from "lucide-react";

type PreferenceKey = "locale" | "currency" | "unit" | "temperature" | "darkMode";

const PREFERENCE_ITEMS: {
  key: PreferenceKey;
  icon: React.ReactNode;
  labelZh: string;
  labelEn: string;
  labelFr: string;
  options: { value: string; labelZh: string; labelEn: string; labelFr: string }[];
}[] = [
  {
    key: "locale",
    icon: <Globe className="w-5 h-5" />,
    labelZh: "语言",
    labelEn: "Language",
    labelFr: "Langue",
    options: [
      { value: "en", labelZh: "English", labelEn: "English", labelFr: "English" },
      { value: "zh", labelZh: "中文", labelEn: "中文", labelFr: "中文" },
      { value: "fr", labelZh: "Français", labelEn: "Français", labelFr: "Français" },
    ],
  },
  {
    key: "currency",
    icon: <DollarSign className="w-5 h-5" />,
    labelZh: "货币",
    labelEn: "Currency",
    labelFr: "Devise",
    options: [
      { value: "CAD", labelZh: "CAD ($)", labelEn: "CAD ($)", labelFr: "CAD ($)" },
      { value: "USD", labelZh: "USD ($)", labelEn: "USD ($)", labelFr: "USD ($)" },
    ],
  },
  {
    key: "unit",
    icon: <Ruler className="w-5 h-5" />,
    labelZh: "面积单位",
    labelEn: "Area unit",
    labelFr: "Unité de surface",
    options: [
      { value: "sqft", labelZh: "平方英尺 (sq ft)", labelEn: "Square feet (sq ft)", labelFr: "Pieds carrés (sq ft)" },
      { value: "sqm", labelZh: "平方米 (m²)", labelEn: "Square meters (m²)", labelFr: "Mètres carrés (m²)" },
    ],
  },
  {
    key: "temperature",
    icon: <Thermometer className="w-5 h-5" />,
    labelZh: "温度",
    labelEn: "Temperature",
    labelFr: "Température",
    options: [
      { value: "celsius", labelZh: "摄氏度 (°C)", labelEn: "Celsius (°C)", labelFr: "Celsius (°C)" },
      { value: "fahrenheit", labelZh: "华氏度 (°F)", labelEn: "Fahrenheit (°F)", labelFr: "Fahrenheit (°F)" },
    ],
  },
  {
    key: "darkMode",
    icon: <Moon className="w-5 h-5" />,
    labelZh: "深色模式",
    labelEn: "Dark mode",
    labelFr: "Mode sombre",
    options: [
      { value: "off", labelZh: "关闭", labelEn: "Off", labelFr: "Désactivé" },
      { value: "on", labelZh: "开启", labelEn: "On", labelFr: "Activé" },
    ],
  },
];

export default function PreferencesPage() {
  const { locale } = useI18n();
  const L = (z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e;

  const [values, setValues] = useState<Record<PreferenceKey, string>>({
    locale: "en",
    currency: "CAD",
    unit: "sqft",
    temperature: "celsius",
    darkMode: "off",
  });

  const updatePreference = useCallback((key: PreferenceKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">
          {L("偏好设置", "Preferences", "Préférences")}
        </h2>
      </div>

      <div className="rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
        {PREFERENCE_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="text-neutral-600">{item.icon}</span>
              <span className="text-sm font-medium text-neutral-900">
                {L(item.labelZh, item.labelEn, item.labelFr)}
              </span>
            </div>
            <select
              value={values[item.key]}
              onChange={(e) => updatePreference(item.key, e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            >
              {item.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {L(opt.labelZh, opt.labelEn, opt.labelFr)}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-500">
        {L("偏好保存在本地设备上。登录后跨设备同步功能即将推出。", "Preferences are stored locally. Cross-device sync after login is coming soon.", "Les préférences sont stockées localement. La synchronisation multi-appareils arrive bientôt.")}
      </p>
    </div>
  );
}

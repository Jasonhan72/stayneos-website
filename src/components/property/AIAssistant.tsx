"use client";

import { useState } from "react";
import { Sparkles, Wand2, Lightbulb, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface AIAssistantProps {
  onGenerateDescription: (input: string) => Promise<string>;
  onSuggestPrice?: (propertyData: {
    city: string;
    bedrooms: number;
    bathrooms: number;
    area?: number;
  }) => Promise<{ min: number; max: number; suggested: number }>;
  onSuggestAmenities?: (description: string) => Promise<string[]>;
}

export function AIAssistant({ 
  onGenerateDescription
}: AIAssistantProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"description" | "price" | "amenities">("description");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const handleGenerate = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      if (activeTab === "description") {
        const description = await onGenerateDescription(input);
        setResult(description);
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error("AI generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "description", label: t("ai.description.title"), icon: Wand2 },
    { id: "price", label: t("ai.pricing.title"), icon: Lightbulb },
    { id: "amenities", label: t("ai.amenities.title"), icon: Sparkles },
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">{t("ai.assistant.title")}</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                setResult(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-purple-700 shadow-sm border border-purple-200"
                  : "text-gray-600 hover:bg-white/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t(`ai.${activeTab}.placeholder`)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows={3}
        />
        
        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("ai.generating")}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {t(`ai.${activeTab}.button`)}
            </>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600 mb-2">{t("ai.result.title")}</p>
          <p className="text-gray-900">{result}</p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
          <span className="font-medium">{t("ai.tip.title")}: </span>
          {t(`ai.${activeTab}.tip`)}
        </p>
      </div>
    </div>
  );
}

// 简化的 AI 生成函数（实际项目中可以调用 OpenAI API）
export async function generatePropertyDescription(location: string): Promise<string> {
  // 模拟 API 调用延迟
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // 基于输入生成描述
  const templates = [
    `这套精致的行政公寓位于${location}，专为追求品质生活的商务人士打造。公寓采用现代简约设计风格，配备高端家具和智能家居系统，让您享受舒适便捷的居住体验。`,
    `欢迎来到${location}！这套豪华公寓拥有宽敞明亮的起居空间，配备全套高端家电和舒适的寝具。无论是商务出行还是长期居住，这里都是您的理想之选。`,
    `位于${location}的高端行政公寓，享有绝佳的地理位置和便利的交通。公寓内部装修精美，配备齐全的厨房设施和高速网络，满足您的一切居住需求。`,
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function suggestPrice(propertyData: {
  city: string;
  bedrooms: number;
  bathrooms: number;
  area?: number;
}): Promise<{ min: number; max: number; suggested: number }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // 基于城市和房型计算价格建议
  const basePrice = propertyData.city ? 150 : 120;
  const bedroomMultiplier = propertyData.bedrooms * 50;
  const bathroomMultiplier = propertyData.bathrooms * 25;
  const areaMultiplier = propertyData.area ? propertyData.area * 0.5 : 0;
  
  const suggested = Math.round(basePrice + bedroomMultiplier + bathroomMultiplier + areaMultiplier);
  
  return {
    min: Math.round(suggested * 0.8),
    max: Math.round(suggested * 1.3),
    suggested,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function suggestAmenities(description: string): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // 基于描述关键词推荐设施 (将来可以基于 description 分析推荐)
  const commonAmenities = [
    "WiFi", "空调", "暖气", "洗衣机", "烘干机", "电视", "厨房", "冰箱",
    "微波炉", "洗碗机", "咖啡机", "高速网络", "健身房", "停车位", "电梯",
    "阳台", "24小时安保", "行李寄存", "熨斗", "吹风机"
  ];
  
  // 随机选择 8-12 个设施
  const count = Math.floor(Math.random() * 5) + 8;
  const shuffled = [...commonAmenities].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function generatePropertyTitle(location: string, type: string, bedrooms: number): string {
  const prefixes = ["豪华", "精致", "现代", "舒适", "高端"];
  const suffixes = ["行政公寓", "公寓", "套房", "住宅"];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${location}${prefix}${bedrooms}室${suffix}`;
}

"use client";

import { useCallback, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";
import { useToastHelpers } from "@/components/ui/Toast";

export default function PersonalInfoPage() {
  const { user, isLoading, isAuthenticated, updateProfile } = useAuth();
  const { locale } = useI18n();
  const L = useCallback((z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e, [locale]);

  const toast = useToastHelpers();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = (l: { zh: string; en: string; fr: string }) =>
    locale === "zh" ? l.zh : locale === "fr" ? l.fr : l.en;

  const rows = useMemo(() => {
    if (!user) return [];
    const email = user.email || "";
    const maskedEmail = email
      ? email.replace(/^(.).*(.@.*)$/, (_m, a, b) => `${a}***${b}`)
      : "";
    const phone = user.phone || "";
    const maskedPhone = phone
      ? phone.replace(/\d(?=\d{4})/g, "*")
      : "";

    return [
      {
        key: "legalName",
        label: { zh: "法定全名", en: "Legal name", fr: "Nom légal" },
        value: user.name || null,
        hint: {
          zh: "预订所用身份证件上的姓名。",
          en: "The name on your government ID.",
          fr: "Le nom figurant sur votre pièce d'identité.",
        },
        cta: { zh: "编辑", en: "Edit", fr: "Modifier" },
      },
      {
        key: "preferredName",
        label: { zh: "常用名", en: "Preferred first name", fr: "Prénom courant" },
        value: user.firstName || null,
        cta: { zh: "编辑", en: "Edit", fr: "Modifier" },
      },
      {
        key: "email",
        label: { zh: "电子邮件地址", en: "Email address", fr: "Adresse e-mail" },
        value: maskedEmail || null,
        hint: {
          zh: "用于登录、接收预订通知。",
          en: "Used for sign-in and booking notifications.",
          fr: "Utilisé pour la connexion et les notifications.",
        },
        cta: { zh: "编辑", en: "Edit", fr: "Modifier" },
      },
      {
        key: "phone",
        label: { zh: "手机号", en: "Phone number", fr: "Numéro de téléphone" },
        value: maskedPhone || null,
        hint: {
          zh: "已确认订单的房客与 NEOS 将通过此号码联系您。",
          en: "Verified guests and NEOS will contact you using this number.",
          fr: "Les voyageurs confirmés et NEOS vous contacteront via ce numéro.",
        },
        cta: { zh: "编辑", en: "Edit", fr: "Modifier" },
      },
      {
        key: "identity",
        label: { zh: "身份认证", en: "Government ID", fr: "Pièce d'identité" },
        value: L("已认证", "Verified", "Vérifié"),
        cta: { zh: "查看", en: "View", fr: "Voir" },
      },
      {
        key: "address",
        label: { zh: "居住地址", en: "Address", fr: "Adresse" },
        value: user.address || null,
        cta: { zh: "编辑", en: "Edit", fr: "Modifier" },
      },
    ];
  }, [user, L]);

  const startEditing = useCallback(
    (key: string, currentValue: string | null) => {
      setEditingKey(key);
      setEditValue(currentValue ?? "");
      setError(null);
    },
    []
  );

  const cancelEditing = useCallback(() => {
    setEditingKey(null);
    setEditValue("");
    setError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editingKey) return;
    setSaving(true);
    setError(null);
    try {
      const fieldMap: Record<string, string> = {
        legalName: "name",
        preferredName: "firstName",
        phone: "phone",
        address: "address",
      };
      const field = fieldMap[editingKey];
      if (!field) throw new Error("Field not editable yet");
      await updateProfile({ [field]: editValue.trim() });
      toast.success(L("个人信息已保存", "Personal info saved", "Informations enregistrées"));
      setEditingKey(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }, [editingKey, editValue, updateProfile, L, toast]);

  if (isLoading) {
    return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  }
  if (!isAuthenticated || !user) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">
        {L("请登录以查看账号信息。", "Please log in to view your account.", "Veuillez vous connecter pour voir votre compte.")}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-neutral-900">
          {L("个人信息", "Personal info", "Informations personnelles")}
        </h2>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="divide-y divide-neutral-200 border-t border-neutral-200">
        {rows.map((row) => (
          <div key={row.key} className={cn("py-5", editingKey === row.key && "bg-neutral-50 -mx-4 px-4 rounded-lg")}>
            {editingKey === row.key ? (
              <div className="space-y-3">
                <label className="text-sm font-medium text-neutral-900">
                  {pick(row.label)}
                </label>
                <input
                  type={row.key === "phone" ? "tel" : "text"}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="rounded-lg border border-neutral-200 px-4 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-neutral-900">
                    {pick(row.label)}
                  </div>
                  <div className="mt-1 text-sm text-neutral-600">
                    {row.value ?? "—"}
                  </div>
                  {row.hint && (
                    <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                      {pick(row.hint)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => startEditing(row.key, row.value)}
                  className="shrink-0 text-sm font-medium text-neutral-900 underline-offset-4 hover:underline"
                >
                  {pick(row.cta)}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 flex items-start gap-4">
        <div className="shrink-0 rounded-lg bg-white p-2 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-neutral-600" />
        </div>
        <div className="text-sm text-neutral-600">
          <p className="font-medium text-neutral-900 mb-1">
            {L("为什么我的信息未显示在此处？", "Why isn't my info shown here?", "Pourquoi mes informations ne s'affichent pas ici ?")}
          </p>
          <p>
            {L("我们隐藏了一些账号详细信息，以便保护您的身份。", "We're hiding some account details to protect your identity.", "Certaines informations sont masquées pour protéger votre identité.")}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { cn } from "@/lib/utils";
import { useToastHelpers } from "@/components/ui/Toast";

type EditableKey = "legalName" | "preferredName" | "phone" | "address";
type Row = {
  key: string;
  label: { zh: string; en: string; fr: string };
  value: string | null;
  rawValue?: string;
  description?: { zh: string; en: string; fr: string };
  cta: { zh: string; en: string; fr: string };
  editable?: boolean;
};

const maskEmail = (email: string) => {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, 1);
  return `${visible}${"*".repeat(Math.max(local.length - 1, 3))}@${domain}`;
};

const maskPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return phone;
  const last4 = digits.slice(-4);
  return `••••••${last4}`;
};

export default function PersonalInfoPage() {
  const { user, isLoading, isAuthenticated, updateProfile } = useAuth();
  const { locale } = useI18n();
  const toast = useToastHelpers();
  const [editingKey, setEditingKey] = useState<EditableKey | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const L = useCallback(
    (zh: string, en: string, fr: string) =>
      locale === "zh" ? zh : locale === "fr" ? fr : en,
    [locale]
  );

  const pick = useCallback(
    (copy: { zh: string; en: string; fr: string }) =>
      locale === "zh" ? copy.zh : locale === "fr" ? copy.fr : copy.en,
    [locale]
  );

  const rows = useMemo<Row[]>(() => {
    if (!user) return [];

    return [
      {
        key: "legalName",
        label: { zh: "法定全名", en: "Legal name", fr: "Nom légal" },
        value: user.name || null,
        rawValue: user.name || "",
        editable: true,
        cta: { zh: "编辑", en: "Edit", fr: "Modifier" },
      },
      {
        key: "preferredName",
        label: { zh: "常用名", en: "Preferred first name", fr: "Prénom usuel" },
        value: user.firstName || null,
        rawValue: user.firstName || "",
        editable: true,
        cta: { zh: "编辑", en: "Edit", fr: "Modifier" },
      },
      {
        key: "email",
        label: { zh: "电子邮件地址", en: "Email address", fr: "Adresse e-mail" },
        value: user.email ? maskEmail(user.email) : null,
        description: {
          zh: "用于登录和接收预订通知。",
          en: "Used for sign-in and booking notifications.",
          fr: "Utilisée pour la connexion et les notifications de réservation.",
        },
        cta: { zh: "编辑", en: "Edit", fr: "Modifier" },
      },
      {
        key: "phone",
        label: { zh: "手机号", en: "Phone number", fr: "Numéro de téléphone" },
        value: user.phone ? maskPhone(user.phone) : null,
        rawValue: user.phone || "",
        editable: true,
        cta: { zh: "编辑", en: "Edit", fr: "Modifier" },
      },
      {
        key: "identity",
        label: { zh: "政府签发身份证件", en: "Government ID", fr: "Pièce d'identité" },
        value: L("已认证", "Verified", "Vérifiée"),
        cta: { zh: "查看", en: "View", fr: "Voir" },
      },
      {
        key: "address",
        label: { zh: "地址", en: "Address", fr: "Adresse" },
        value: user.address || null,
        rawValue: user.address || "",
        editable: true,
        cta: { zh: "编辑", en: "Edit", fr: "Modifier" },
      },
    ];
  }, [user, L]);

  const startEditing = useCallback((row: Row) => {
    if (!row.editable) {
      if (row.key === "email") {
        toast.info?.(L("邮箱修改需要验证流程。", "Email changes go through verification.", "Le changement d'e-mail passe par une vérification."));
      }
      return;
    }

    setEditingKey(row.key as EditableKey);
    setEditValue(row.rawValue ?? "");
    setError(null);
  }, [L, toast]);

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
      const fieldMap: Record<EditableKey, string> = {
        legalName: "name",
        preferredName: "firstName",
        phone: "phone",
        address: "address",
      };
      const field = fieldMap[editingKey];
      await updateProfile({ [field]: editValue.trim() });
      toast.success(L("个人信息已保存", "Personal info saved", "Informations personnelles enregistrées"));
      cancelEditing();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }, [cancelEditing, editValue, editingKey, L, toast, updateProfile]);

  if (isLoading) {
    return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-12">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">
          {L("请登录以查看账号信息。", "Please log in to view your account.", "Veuillez vous connecter pour voir votre compte.")}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12 lg:px-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">{L("个人信息", "Personal info", "Informations personnelles")}</h1>
        <p className="mt-3 text-sm leading-6 text-neutral-500">
          {L(
            "其中一些信息可能会展示给其他用户，用于提供更顺畅的预订体验。",
            "Some info may be visible to others so they can better understand who they're staying with or hosting.",
            "Certaines informations peuvent être visibles par d'autres pour mieux savoir avec qui ils séjournent ou qu'ils accueillent."
          )}
        </p>
      </div>

      {error && (
        <div className="mt-6 max-w-3xl rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-10 max-w-3xl divide-y divide-neutral-200 border-t border-neutral-200">
        {rows.map((row) => {
          const isEditing = editingKey === row.key;
          return (
            <div key={row.key} className={cn("py-6", isEditing && "bg-neutral-50 -mx-4 rounded-2xl px-4")}>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{pick(row.label)}</div>
                    <input
                      type={row.key === "phone" ? "tel" : "text"}
                      value={editValue}
                      onChange={(event) => setEditValue(event.target.value)}
                      className="mt-3 w-full rounded-xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => void handleSave()}
                      disabled={saving}
                      className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
                    >
                      {saving ? "Saving…" : L("保存", "Save", "Enregistrer")}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-white"
                    >
                      {L("取消", "Cancel", "Annuler")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-neutral-500">{pick(row.label)}</p>
                    <p className="mt-2 text-base text-neutral-900">{row.value || "—"}</p>
                    {row.description && (
                      <p className="mt-2 text-sm leading-6 text-neutral-500">{pick(row.description)}</p>
                    )}
                  </div>
                  <button
                    onClick={() => startEditing(row)}
                    className="shrink-0 text-sm font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-700"
                  >
                    {pick(row.cta)}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12 max-w-3xl rounded-3xl border border-neutral-200 bg-neutral-50 p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-neutral-600" />
          </div>
          <div>
            <p className="text-base font-medium text-neutral-900">
              {L("为什么我的信息未显示在此处？", "Why isn't my info shown here?", "Pourquoi mes informations ne s'affichent-elles pas ici ?")}
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              {L(
                "为了保护您的身份，我们隐藏了部分账户详细信息。",
                "We're hiding some account details to protect your identity.",
                "Nous masquons certaines informations du compte pour protéger votre identité."
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

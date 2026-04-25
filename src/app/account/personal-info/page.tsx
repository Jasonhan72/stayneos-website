"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

type Row = {
  key: string;
  label: { zh: string; en: string; fr: string };
  value: string | null;
  hint?: { zh: string; en: string; fr: string };
  cta: { zh: string; en: string; fr: string };
  onEdit?: () => void;
};

export default function PersonalInfoPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { locale } = useI18n();
  const L = (z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e;
  const pick = (l: Row["label"]) =>
    locale === "zh" ? l.zh : locale === "fr" ? l.fr : l.en;

  const [editingKey, setEditingKey] = useState<string | null>(null);

  const rows: Row[] = useMemo(() => {
    const Llocal = (z: string, e: string, f: string) =>
      locale === "zh" ? z : locale === "fr" ? f : e;
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
        label: { zh: "手机号", en: "Phone numbers", fr: "Numéros de téléphone" },
        value: maskedPhone || null,
        hint: {
          zh: "已确认订单的房客与 NEOS 将通过此号码联系您。您可以添加其他手机号并选择其用途。",
          en: "Verified guests and NEOS will contact you using this number.",
          fr: "Les voyageurs confirmés et NEOS vous contacteront via ce numéro.",
        },
        cta: { zh: "编辑", en: "Edit", fr: "Modifier" },
      },
      {
        key: "identity",
        label: { zh: "身份认证", en: "Government ID", fr: "Pièce d'identité" },
        value: Llocal("已认证", "Verified", "Vérifié"),
        cta: { zh: "查看", en: "View", fr: "Voir" },
      },
      {
        key: "residence",
        label: { zh: "居住地址", en: "Address", fr: "Adresse" },
        value: Llocal("已提供", "Provided", "Fourni"),
        cta: { zh: "编辑", en: "Edit", fr: "Modifier" },
      },
      {
        key: "mailing",
        label: { zh: "邮寄地址", en: "Mailing address", fr: "Adresse postale" },
        value: Llocal("已提供", "Provided", "Fourni"),
        cta: { zh: "编辑", en: "Edit", fr: "Modifier" },
      },
      {
        key: "emergency",
        label: { zh: "紧急联系人", en: "Emergency contact", fr: "Contact d'urgence" },
        value: user.emergencyContact?.name || null,
        cta: user.emergencyContact?.name
          ? { zh: "编辑", en: "Edit", fr: "Modifier" }
          : { zh: "添加", en: "Add", fr: "Ajouter" },
      },
    ];
  }, [user, locale]);

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

      <div className="divide-y divide-neutral-200 border-t border-neutral-200">
        {rows.map((row) => (
          <RowView
            key={row.key}
            row={row}
            label={pick(row.label)}
            hint={row.hint ? pick(row.hint) : undefined}
            ctaLabel={pick(row.cta)}
            editing={editingKey === row.key}
            onToggle={() =>
              setEditingKey((k) => (k === row.key ? null : row.key))
            }
          />
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 flex items-start gap-4">
        <div className="shrink-0 rounded-lg bg-white p-2 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-neutral-600" />
        </div>
        <div className="text-sm text-neutral-600">
          <p className="font-medium text-neutral-900 mb-1">
            {L(
              "为什么我的信息未显示在此处？",
              "Why isn't my info shown here?",
              "Pourquoi mes informations ne s'affichent pas ici ?"
            )}
          </p>
          <p>
            {L(
              "我们隐藏了一些账号详细信息，以便保护您的身份。",
              "We're hiding some account details to protect your identity.",
              "Certaines informations sont masquées pour protéger votre identité."
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function RowView({
  row,
  label,
  hint,
  ctaLabel,
  editing,
  onToggle,
}: {
  row: Row;
  label: string;
  hint?: string;
  ctaLabel: string;
  editing: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "py-5",
        editing && "bg-neutral-50 -mx-4 px-4 rounded-lg"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-medium text-neutral-900">{label}</div>
          <div className="mt-1 text-sm text-neutral-600">
            {row.value ?? "—"}
          </div>
          {hint && !editing && (
            <p className="mt-2 text-xs leading-relaxed text-neutral-500">
              {hint}
            </p>
          )}
        </div>
        <button
          onClick={onToggle}
          className="shrink-0 text-sm font-medium text-neutral-900 underline-offset-4 hover:underline"
        >
          {editing ? "Cancel" : ctaLabel}
        </button>
      </div>
      {editing && (
        <p className="mt-3 text-xs text-neutral-500">
          Inline editor coming soon.
        </p>
      )}
    </div>
  );
}

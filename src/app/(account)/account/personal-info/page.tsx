"use client";

import { useCallback, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { useToastHelpers } from "@/components/ui/Toast";
import { AccountActionLink, AccountInfoAside, AccountPrimaryButton, AccountRow, AccountSecondaryButton, AccountSectionCard, AccountTextInput } from "@/components/account/AccountShell";
import { AccountDesktopShell } from "@/components/account/AccountDesktopShell";

export default function PersonalInfoPage() {
  const { user, isLoading, isAuthenticated, updateProfile } = useAuth();
  const { locale } = useI18n();
  const toast = useToastHelpers();
  const L = useCallback((z: string, e: string, f: string) => (locale === "zh" ? z : locale === "fr" ? f : e), [locale]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    if (!user) return [];
    return [
      { key: "legalName", label: L("法定姓名", "Legal name", "Nom légal"), value: user.name || null, hint: L("此姓名会用于预订与身份核验。", "This is the name on your reservation and ID verification.", "Ce nom est utilisé pour la réservation et la vérification.") },
      { key: "preferredName", label: L("常用名", "Preferred first name", "Prénom préféré"), value: user.firstName || null },
      { key: "email", label: L("电子邮件地址", "Email address", "Adresse e-mail"), value: user.email || null, hint: L("用于登录、接收订单和入住提醒。", "Used for sign-in, reservation updates, and stay reminders.", "Utilisé pour la connexion et les rappels de séjour.") },
      { key: "phone", label: L("手机号", "Phone number", "Numéro de téléphone"), value: user.phone || null, hint: L("NEOS 和房东会在需要时通过此号码联系您。", "NEOS and hosts may use this number when they need to reach you.", "NEOS et les hôtes peuvent utiliser ce numéro pour vous joindre.") },
      { key: "identity", label: L("身份验证", "Identity verification", "Vérification d'identité"), value: L("已验证", "Verified", "Vérifié"), readonly: true },
      { key: "address", label: L("居住地址", "Residential address", "Adresse résidentielle"), value: null },
      { key: "emergency", label: L("紧急联系人", "Emergency contact", "Contact d'urgence"), value: null },
    ];
  }, [user, L]);

  const startEditing = (key: string, currentValue: string | null) => {
    setEditingKey(key);
    setEditValue(currentValue || "");
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setEditValue("");
  };

  const handleSave = async () => {
    if (!editingKey) return;
    const fieldMap: Record<string, string> = { legalName: "name", preferredName: "firstName", phone: "phone" };
    if (!fieldMap[editingKey]) {
      toast.success(L("此字段的编辑入口已就位，后端保存将在下一步接通。", "This field is now ready in the new layout. Backend save can be connected next.", "Ce champ est prêt dans la nouvelle interface. La sauvegarde backend peut être branchée ensuite."));
      setEditingKey(null);
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ [fieldMap[editingKey]]: editValue.trim() });
      toast.success(L("已保存", "Saved", "Enregistré"));
      setEditingKey(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  if (!isAuthenticated || !user) return <div className="mx-auto max-w-5xl px-6 py-16"><div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">{L("请登录以查看账号信息。", "Please log in to view your account.", "Veuillez vous connecter pour voir votre compte.")}</div></div>;

  return (
    <AccountDesktopShell
      title={L("个人信息", "Personal info", "Informations personnelles")}
      description={L("管理您的法定姓名、联系方式和身份验证信息。", "Manage your legal name, contact details, and verification information.", "Gérez votre nom légal, vos coordonnées et vos informations de vérification.")}
      aside={<div className="space-y-4"><AccountInfoAside title={L("为什么有些信息未显示？", "Why isn’t some info shown here?", "Pourquoi certaines informations n’apparaissent-elles pas ?")} body={L("我们会隐藏部分账号细节，以保护您的身份，并仅在预订或核验必要时使用。", "We hide some account details to help protect your identity and only use them when needed for bookings or verification.", "Nous masquons certains détails pour protéger votre identité et ne les utilisons qu’en cas de besoin.")} /><AccountInfoAside title={L("哪些信息会共享？", "What info is shared?", "Quelles informations sont partagées ?")} body={L("确认预订后，房东会看到您在入住所需的必要联系信息。", "After a booking is confirmed, hosts see the contact details needed to support your stay.", "Après confirmation d’une réservation, l’hôte voit les coordonnées nécessaires au séjour.")} /><AccountInfoAside title={L("为什么完善资料？", "Why complete your profile?", "Pourquoi compléter votre profil ?")} body={L("完善资料可以加快预订审核、身份验证和入住沟通。", "A complete profile helps speed up reservation review, verification, and check-in communication.", "Un profil complet accélère l’examen, la vérification et la communication d’arrivée.")} /></div>}
    >
      <AccountSectionCard title={L("个人信息", "Personal information", "Informations personnelles")}>
        {rows.map((row) => {
          const isEditing = editingKey === row.key;
          const hasValue = !!row.value;
          const actionText = row.readonly ? null : hasValue ? L("编辑", "Edit", "Modifier") : L("添加", "Add", "Ajouter");
          return (
            <AccountRow
              key={row.key}
              label={row.label}
              value={hasValue ? row.value : <span className="text-neutral-500">{L("未提供", "Not provided", "Non fourni")}</span>}
              hint={row.hint}
              action={actionText ? <AccountActionLink onClick={() => startEditing(row.key, typeof row.value === 'string' ? row.value : null)}>{actionText}</AccountActionLink> : undefined}
              expanded={isEditing ? (
                <div className="max-w-xl space-y-4 rounded-[24px] border border-neutral-200 bg-neutral-50 p-5">
                  <AccountTextInput value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus />
                  <div className="flex flex-wrap gap-3">
                    <AccountPrimaryButton onClick={handleSave} disabled={saving}>{saving ? "Saving…" : L("保存", "Save", "Enregistrer")}</AccountPrimaryButton>
                    <AccountSecondaryButton onClick={cancelEditing}>{L("取消", "Cancel", "Annuler")}</AccountSecondaryButton>
                  </div>
                </div>
              ) : undefined}
            />
          );
        })}
      </AccountSectionCard>
    </AccountDesktopShell>
  );
}

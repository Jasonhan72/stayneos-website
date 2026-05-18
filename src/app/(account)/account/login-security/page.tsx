"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { useToastHelpers } from "@/components/ui/Toast";
import { AccountActionLink, AccountPrimaryButton, AccountRow, AccountSecondaryButton, AccountSectionCard, AccountTextInput } from "@/components/account/AccountShell";
import { AccountDesktopShell } from "@/components/account/AccountDesktopShell";

type SessionItem = { id: string; device: string; ip: string | null; location: string | null; lastActiveAt: string; isCurrent: boolean };

export default function LoginSecurityPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { locale } = useI18n();
  const toast = useToastHelpers();
  const L = useCallback((z: string, e: string, f: string) => (locale === "zh" ? z : locale === "fr" ? f : e), [locale]);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [sessions, setSessions] = useState<SessionItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/account/sessions', { credentials: 'include', cache: 'no-store' });
        const body = await res.json();
        if (res.ok) setSessions(body.sessions || []);
      } catch {}
    };
    if (isAuthenticated) void load();
  }, [isAuthenticated]);

  const changePassword = async () => {
    if (newPw !== confirmPw) return toast.error(L("两次密码不一致", "Passwords don't match", "Les mots de passe ne correspondent pas"));
    setSaving(true);
    try {
      const res = await fetch('/api/auth/set-password', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }) });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Failed to change password');
      toast.success(L("密码已更新", "Password updated", "Mot de passe mis à jour"));
      setShowPasswordForm(false);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : L("密码修改失败", "Failed to change password", "Échec du changement de mot de passe"));
    } finally { setSaving(false); }
  };

  if (isLoading) return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  if (!isAuthenticated || !user) return <div className="mx-auto max-w-5xl px-6 py-16"><div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">{L("请登录以查看。", "Please log in.", "Veuillez vous connecter.")}</div></div>;

  return (
    <AccountDesktopShell title={L("登录与安全", "Login & security", "Connexion et sécurité")} description={L("更新密码，并查看当前已登录设备。", "Update your password and review devices where you're signed in.", "Mettez à jour votre mot de passe et consultez vos appareils connectés.")}>
      <div className="space-y-6">
        <AccountSectionCard title={L("登录", "Login", "Connexion")}>
          <AccountRow label={L("密码", "Password", "Mot de passe")} value="••••••••" action={<AccountActionLink onClick={() => setShowPasswordForm((v) => !v)}>{showPasswordForm ? L("取消", "Cancel", "Annuler") : L("编辑", "Edit", "Modifier")}</AccountActionLink>} expanded={showPasswordForm ? <div className="max-w-xl space-y-3 rounded-[24px] border border-neutral-200 bg-neutral-50 p-5"><AccountTextInput type="password" placeholder={L("当前密码", "Current password", "Mot de passe actuel")} value={currentPw} onChange={(e)=>setCurrentPw(e.target.value)} /><AccountTextInput type="password" placeholder={L("新密码", "New password", "Nouveau mot de passe")} value={newPw} onChange={(e)=>setNewPw(e.target.value)} /><AccountTextInput type="password" placeholder={L("确认新密码", "Confirm new password", "Confirmer le mot de passe")} value={confirmPw} onChange={(e)=>setConfirmPw(e.target.value)} /><div className="flex flex-wrap gap-3"><AccountPrimaryButton onClick={changePassword} disabled={saving}>{saving ? L("保存中…", "Saving…", "Enregistrement…") : L("保存", "Save", "Enregistrer")}</AccountPrimaryButton><AccountSecondaryButton onClick={() => setShowPasswordForm(false)}>{L("取消", "Cancel", "Annuler")}</AccountSecondaryButton></div></div> : undefined} />
          <AccountRow label={L("双重验证", "Two-step verification", "Vérification en deux étapes")} value={<span className="text-neutral-500">{L("未启用", "Not enabled", "Non activée")}</span>} action={<AccountActionLink onClick={() => toast.success(L("入口已预留，后续接通 2FA。", "Entry point is ready for 2FA hookup.", "Point d’entrée prêt pour l’intégration 2FA."))}>{L("添加", "Add", "Ajouter")}</AccountActionLink>} />
        </AccountSectionCard>

        <AccountSectionCard title={L("设备与会话", "Devices and sessions", "Appareils et sessions")} description={L("这些设备最近登录过您的账号。", "These devices recently signed in to your account.", "Ces appareils se sont récemment connectés à votre compte.")} action={<AccountActionLink onClick={() => logout()}>{L("退出所有设备", "Log out of all devices", "Déconnecter tous les appareils")}</AccountActionLink>}>
          {(sessions.length ? sessions : [{ id: 'current', device: L("当前浏览器", "Current browser", "Navigateur actuel"), ip: null, location: null, lastActiveAt: new Date().toISOString(), isCurrent: true }]).map((session) => (
            <AccountRow key={session.id} label={session.device} value={session.location || session.ip || L("最近活跃", "Recently active", "Récemment actif")} hint={new Date(session.lastActiveAt).toLocaleString()} action={!session.isCurrent ? <AccountActionLink>{L("退出", "Log out", "Déconnexion")}</AccountActionLink> : <span className="text-sm font-medium text-neutral-500">{L("当前设备", "Current device", "Appareil actuel")}</span>} />
          ))}
        </AccountSectionCard>
      </div>
    </AccountDesktopShell>
  );
}

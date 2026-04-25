"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { KeyRound, LogOut } from "lucide-react";

export default function LoginSecurityPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { locale } = useI18n();
  const L = (z: string, e: string, f: string) =>
    locale === "zh" ? z : locale === "fr" ? f : e;

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwDone, setPwDone] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (newPw.length < 8) {
      setPwError(L("密码至少 8 个字符。", "Password must be at least 8 characters.", "Le mot de passe doit comporter au moins 8 caractères."));
      return;
    }
    if (newPw !== confirmPw) {
      setPwError(L("两次密码不一致。", "Passwords don't match.", "Les mots de passe ne correspondent pas."));
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to change password");
      setPwDone(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setShowPasswordForm(false);
      setTimeout(() => setPwDone(false), 4000);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPwSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  }
  if (!isAuthenticated || !user) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">
        {L("请登录以查看。", "Please log in.", "Veuillez vous connecter.")}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">
          {L("登录与安全", "Login & security", "Connexion et sécurité")}
        </h2>
      </div>

      {pwDone && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {L("密码已更新。", "Password updated.", "Mot de passe mis à jour.")}
        </div>
      )}

      <div className="rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-neutral-600 shrink-0" />
            <div>
              <div className="text-sm font-medium text-neutral-900">
                {L("密码", "Password", "Mot de passe")}
              </div>
              <div className="mt-0.5 text-sm text-neutral-500">
                {L("••••••••", "••••••••", "••••••••")}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="shrink-0 text-sm font-medium text-neutral-900 underline-offset-4 hover:underline"
          >
            {showPasswordForm ? L("取消", "Cancel", "Annuler") : L("修改", "Change", "Modifier")}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-5 space-y-3 border-t border-neutral-100 pt-5">
            {pwError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                {pwError}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                {L("当前密码", "Current password", "Mot de passe actuel")}
              </label>
              <input
                type="password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                autoComplete="current-password"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                {L("新密码", "New password", "Nouveau mot de passe")}
              </label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                {L("确认新密码", "Confirm new password", "Confirmer le nouveau mot de passe")}
              </label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
                autoComplete="new-password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={pwSaving}
              className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {pwSaving ? "Saving…" : L("更新密码", "Update password", "Mettre à jour")}
            </button>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5 text-neutral-600 shrink-0" />
            <div>
              <div className="text-sm font-medium text-neutral-900">
                {L("登录方式", "Login methods", "Méthodes de connexion")}
              </div>
              <div className="mt-0.5 text-sm text-neutral-500">
                {user.email}
                {L("（电子邮件）", " (email)", " (e-mail)")}
              </div>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            {L("已启用", "Active", "Actif")}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-5">
        <h3 className="text-sm font-medium text-neutral-900 mb-2">
          {L("活跃会话", "Active sessions", "Sessions actives")}
        </h3>
        <p className="text-xs text-neutral-500">
          {L("管理您的登录设备。此功能将在后续版本中提供。", "Manage devices where you're logged in. Coming in a future update.", "Gestion des appareils connectés. À venir dans une prochaine mise à jour.")}
        </p>
      </div>
    </div>
  );
}

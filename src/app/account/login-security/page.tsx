"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/lib/context/UserContext";
import { KeyRound, LogOut, Monitor, ShieldOff } from "lucide-react";
import { useToastHelpers } from "@/components/ui/Toast";

type SessionItem = {
  id: string;
  device: string;
  ip: string | null;
  userAgent: string | null;
  location: string | null;
  lastActiveAt: string;
  createdAt: string;
  isCurrent: boolean;
};

export default function LoginSecurityPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { locale } = useI18n();
  const toast = useToastHelpers();
  const L = useCallback((z: string, e: string, f: string) => locale === "zh" ? z : locale === "fr" ? f : e, [locale]);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwDone, setPwDone] = useState(false);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch('/api/account/sessions', { credentials: 'include', cache: 'no-store' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Failed to load sessions');
      setSessions(body.sessions || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load sessions');
    } finally {
      setSessionsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isAuthenticated) void loadSessions();
    else setSessionsLoading(false);
  }, [isAuthenticated, loadSessions]);

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

  const revokeSession = useCallback(async (id: string) => {
    setBusySessionId(id);
    try {
      const res = await fetch(`/api/account/sessions/${id}`, { method: 'DELETE', credentials: 'include' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Failed to revoke session');
      toast.success(L('会话已撤销', 'Session revoked', 'Session révoquée'));
      if (body.currentSessionRevoked) {
        await logout();
        return;
      }
      await loadSessions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to revoke session');
    } finally {
      setBusySessionId(null);
    }
  }, [L, loadSessions, logout, toast]);

  const revokeAll = useCallback(async () => {
    setRevokingAll(true);
    try {
      const res = await fetch('/api/account/sessions/revoke-all', { method: 'POST', credentials: 'include' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'Failed to revoke sessions');
      toast.success(L('其他会话已撤销', 'Other sessions revoked', 'Les autres sessions ont été révoquées'));
      await loadSessions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to revoke sessions');
    } finally {
      setRevokingAll(false);
    }
  }, [L, loadSessions, toast]);

  if (isLoading || sessionsLoading) return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  if (!isAuthenticated || !user) return <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">{L("请登录以查看。", "Please log in.", "Veuillez vous connecter.")}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">{L("登录与安全", "Login & security", "Connexion et sécurité")}</h2>
      </div>

      {pwDone && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{L("密码已更新。", "Password updated.", "Mot de passe mis à jour.")}</div>}

      <div className="rounded-2xl border border-neutral-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-neutral-600 shrink-0" />
            <div>
              <div className="text-sm font-medium text-neutral-900">{L("密码", "Password", "Mot de passe")}</div>
              <div className="mt-0.5 text-sm text-neutral-500">{L("••••••••", "••••••••", "••••••••")}</div>
            </div>
          </div>
          <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="shrink-0 text-sm font-medium text-neutral-900 underline-offset-4 hover:underline">
            {showPasswordForm ? L("取消", "Cancel", "Annuler") : L("修改", "Change", "Modifier")}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-5 space-y-3 border-t border-neutral-100 pt-5">
            {pwError && <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">{pwError}</div>}
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">{L("当前密码", "Current password", "Mot de passe actuel")}</label>
              <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900" autoComplete="current-password" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">{L("新密码", "New password", "Nouveau mot de passe")}</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900" autoComplete="new-password" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">{L("确认新密码", "Confirm new password", "Confirmer le nouveau mot de passe")}</label>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900" autoComplete="new-password" required />
            </div>
            <button type="submit" disabled={pwSaving} className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50">
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
              <div className="text-sm font-medium text-neutral-900">{L("登录方式", "Login methods", "Méthodes de connexion")}</div>
              <div className="mt-0.5 text-sm text-neutral-500">{user.email}{L("（电子邮件）", " (email)", " (e-mail)")}</div>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{L("已启用", "Active", "Actif")}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-1">{L("活跃会话", "Active sessions", "Sessions actives")}</h3>
            <p className="text-xs text-neutral-500">{L("查看并撤销您已登录的设备。", "Review and revoke devices where you're signed in.", "Passez en revue et révoquez vos appareils connectés.")}</p>
          </div>
          <button onClick={() => void revokeAll()} disabled={revokingAll || sessions.filter((session) => !session.isCurrent).length === 0} className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 disabled:opacity-50">
            <ShieldOff className="w-4 h-4" />
            {revokingAll ? '...' : L('撤销其他设备', 'Revoke others', 'Révoquer les autres')}
          </button>
        </div>
        <div className="divide-y divide-neutral-100">
          {sessions.length > 0 ? sessions.map((session) => (
            <div key={session.id} className="py-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Monitor className="w-5 h-5 text-neutral-500 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-neutral-900">{session.device}</div>
                    {session.isCurrent && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">{L('当前设备', 'Current device', 'Appareil actuel')}</span>}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">{session.location || 'Unknown location'}{session.ip ? ` · ${session.ip}` : ''}</div>
                  <div className="mt-1 text-xs text-neutral-500">{L('最近活跃', 'Last active', 'Dernière activité')} {new Date(session.lastActiveAt).toLocaleString()}</div>
                </div>
              </div>
              {!session.isCurrent && <button onClick={() => void revokeSession(session.id)} disabled={busySessionId === session.id} className="text-xs text-red-600 underline underline-offset-2 hover:text-red-700 disabled:opacity-50">{L('撤销', 'Revoke', 'Révoquer')}</button>}
            </div>
          )) : <div className="py-6 text-sm text-neutral-500">{L('暂无活跃会话。', 'No active sessions found.', 'Aucune session active trouvée.')}</div>}
        </div>
      </div>
    </div>
  );
}

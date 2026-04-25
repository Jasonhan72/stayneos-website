"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { locale } = useI18n();
  const toast = useToastHelpers();
  const L = (z: string, e: string, f: string) => locale === "zh" ? z : locale === "fr" ? f : e;

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

  useEffect(() => { if (isAuthenticated) void loadSessions(); else setSessionsLoading(false); }, [isAuthenticated, loadSessions]);

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
  }, [loadSessions, logout, toast, L]);

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
  }, [loadSessions, toast, L]);

  if (isLoading || sessionsLoading) return <div className="py-20 text-center text-neutral-400">Loading…</div>;
  if (!isAuthenticated || !user) return <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-sm text-neutral-600">{L("请登录以查看。", "Please log in.", "Veuillez vous connecter.")}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">{L("登录与安全", "Login & security", "Connexion et sécurité")}</h2>
      </div>

      {pwDone && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{L("密码已更新。", "Password updated.", "Mot de passe mis à jour.")}</div>}

      <div className="rounded-2xl border border-neutral-200 p-5">...
      </div>
    </div>
  );
}

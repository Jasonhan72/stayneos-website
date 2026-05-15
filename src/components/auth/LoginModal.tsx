'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/context/UserContext';

type LoginModalReason = 'reserve' | 'wishlist' | 'message';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
  callbackUrl?: string;
  reason?: LoginModalReason;
}

export function LoginModal({ isOpen, onClose, onSuccess, callbackUrl = '/', reason = 'reserve' }: LoginModalProps) {
  const { t } = useI18n();
  const { refreshUser } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) setMode('login');
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const titleByReason: Record<LoginModalReason, string> = {
    reserve: t('auth.modal.reserveTitle', 'Log in to confirm your booking'),
    wishlist: t('auth.modal.wishlistTitle', 'Log in to save this home'),
    message: t('auth.modal.messageTitle', 'Log in to message NEOS'),
  };

  const handleSuccess = async () => {
    await refreshUser();
    onClose();
    await onSuccess();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 px-0 sm:items-center sm:px-4" role="dialog" aria-modal="true" aria-labelledby="login-modal-title">
      <button className="absolute inset-0 h-full w-full cursor-default" aria-label={t('common.close', 'Close')} onClick={onClose} />
      <div className="relative max-h-screen w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-[420px] sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex min-h-16 items-center justify-center border-b border-neutral-200 bg-white px-14 py-4">
          <button
            type="button"
            onClick={onClose}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-neutral-800 transition-colors hover:bg-neutral-100"
            aria-label={t('common.close', 'Close')}
          >
            <X size={20} />
          </button>
          <h2 id="login-modal-title" className="text-center text-base font-semibold text-neutral-900">
            {mode === 'login' ? titleByReason[reason] : t('auth.modal.signupTitle', 'Create your NEOS account')}
          </h2>
        </div>

        <div className="px-5 py-6 sm:px-6">
          {mode === 'login' ? (
            <LoginForm
              callbackUrl={callbackUrl}
              onSuccess={handleSuccess}
              redirectOnSuccess={false}
              compact
              onSwitchToRegister={() => setMode('register')}
            />
          ) : (
            <RegisterForm
              onSuccess={handleSuccess}
              redirectOnSuccess={false}
              compact
              onSwitchToLogin={() => setMode('login')}
            />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

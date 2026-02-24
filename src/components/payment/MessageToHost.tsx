'use client';

import { useState } from 'react';
import { ChevronLeft, User, MessageSquare } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface MessageToHostProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onSubmit: (message: string) => void;
  hostName?: string;
  initialMessage?: string;
}

export function MessageToHost({
  isOpen,
  onClose,
  onBack,
  onSubmit,
  hostName = 'the host',
  initialMessage = '',
}: MessageToHostProps) {
  const { t } = useI18n();
  const [message, setMessage] = useState(initialMessage);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const placeholderExamples = [
    t('payment.messageExample1') || "Hi! I'm visiting Toronto for a business conference and your place looks perfect for my stay.",
    t('payment.messageExample2') || "Looking forward to staying at your beautiful apartment! I'll be working remotely during the weekdays.",
    t('payment.messageExample3') || "This will be my first time in Toronto. Excited to explore the city from your conveniently located place!",
  ];

  const randomPlaceholder = placeholderExamples[Math.floor(Math.random() * placeholderExamples.length)];

  const handleSubmit = () => {
    if (message.trim().length < 10) {
      setError(t('payment.messageTooShort') || 'Please write a bit more about your trip');
      return;
    }
    onSubmit(message.trim());
  };

  const handleChange = (value: string) => {
    setMessage(value);
    if (error && value.trim().length >= 10) {
      setError('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-neutral-900" />
        </button>
        
        <button 
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
        >
          {t('common.skip') || 'Skip'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
          {t('payment.writeMessage') || 'Write a message to the host'}
        </h1>

        <p className="text-neutral-600 mb-6">
          {t('payment.messagePrompt', { hostName }) || 
            `Before you can continue, let ${hostName} know a little about your trip and why their place is a good fit.`}
        </p>

        {/* Host Info Card */}
        <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl mb-6">
          <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-neutral-500" />
          </div>
          <div>
            <p className="font-medium text-neutral-900">
              {t('payment.yourHost') || 'Your host'}: {hostName}
            </p>
            <p className="text-sm text-neutral-500">
              {t('payment.typicallyResponds') || 'Typically responds within an hour'}
            </p>
          </div>
        </div>

        {/* Message Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            {t('payment.yourMessage') || 'Your message'}
          </label>
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={randomPlaceholder}
              rows={6}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-colors resize-none ${
                error ? 'border-red-500' : 'border-neutral-300'
              }`}
            />
            <div className="absolute bottom-3 right-3">
              <MessageSquare className="w-5 h-5 text-neutral-300" />
            </div>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
          
          <p className="text-sm text-neutral-500 mt-2">
            {message.length} {t('payment.characters') || 'characters'}
          </p>
        </div>

        {/* Tips */}
        <div className="p-4 bg-neutral-50 rounded-xl">
          <h3 className="font-medium text-neutral-900 mb-2">
            {t('payment.tips') || 'Tips for a great message:'}
          </h3>
          <ul className="text-sm text-neutral-600 space-y-1">
            <li>• {t('payment.tip1') || 'Introduce yourself and your travel companions'}</li>
            <li>• {t('payment.tip2') || 'Mention the purpose of your trip'}</li>
            <li>• {t('payment.tip3') || 'Share why you chose this place'}</li>
            <li>• {t('payment.tip4') || 'Ask any questions you may have'}</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-4 py-4">
        <button
          onClick={handleSubmit}
          className="w-full py-4 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-colors"
        >
          {t('common.next') || 'Next'}
        </button>
      </div>
    </div>
  );
}

export default MessageToHost;
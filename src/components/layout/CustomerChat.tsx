'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { csrfFetch } from '@/lib/security/csrf-client';
import { ChatExternalPropertyCard, type ChatExternalProperty } from '@/components/shared/chat/ChatExternalPropertyCard';
import { ChatPropertyCard } from '@/components/shared/chat/ChatPropertyCard';

type ChatProperty = {
  id: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  image?: string;
  url?: string;
};

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  externalProperties?: ChatExternalProperty[];
  properties?: ChatProperty[];
}

interface ChatHistory {
  messages: Message[];
  sessionId: string;
}

export function CustomerChat() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const saved = localStorage.getItem('neos_chat_history');
        if (saved) {
          const history: ChatHistory = JSON.parse(saved);
          setMessages(history.messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
          setSessionId(history.sessionId);
        } else {
          // Generate new session ID if no history exists
          const newSessionId = `website_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          setSessionId(newSessionId);
          
          // Add welcome message
          const welcomeMessage: Message = {
            id: 'welcome',
            text: t('chat.welcome', "Hi! I'm Aria, NEOS Customer Care. How can I help you today?"),
            sender: 'bot',
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
        // Generate new session ID on error
        const newSessionId = `website_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
      }
    };

    loadChatHistory();
  }, [t]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0 && sessionId) {
      const history: ChatHistory = {
        messages: messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp
        })),
        sessionId
      };
      try {
        localStorage.setItem('neos_chat_history', JSON.stringify(history));
      } catch (err) {
        console.error('Failed to save chat history:', err);
      }
    }
  }, [messages, sessionId]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Prevent body scroll when chat is open on mobile
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = originalOverflow; };
    }
  }, [isOpen]);

  // Close chat when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen && 
        chatWindowRef.current && 
        !chatWindowRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.chat-toggle-button')
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!inputText.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await csrfFetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          sessionId: sessionId || undefined,
          history: messages.slice(-10).map(m => ({
            id: m.id,
            text: m.text,
            sender: m.sender,
          })),
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update session ID if returned from server
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
      }
      
      const externalProperties: ChatExternalProperty[] | undefined =
        Array.isArray(data.externalProperties) && data.externalProperties.length > 0
          ? data.externalProperties
          : undefined;
      const properties: ChatProperty[] | undefined =
        Array.isArray(data.properties) && data.properties.length > 0
          ? data.properties.map((property: {
              id: string;
              title: string;
              location: string;
              price?: number;
              monthlyPrice?: number;
              image?: string;
              url?: string;
              bedrooms?: number;
            }) => ({
              id: property.id,
              title: property.title,
              location: property.location,
              price: Number(property.price ?? property.monthlyPrice ?? 0),
              bedrooms: Number(property.bedrooms || 0),
              image: property.image,
              url: property.url,
            }))
          : undefined;

      const botMessage: Message = {
        id: Date.now().toString(),
        text: data.text,
        sender: 'bot',
        timestamp: new Date(),
        externalProperties,
        properties,
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(t('chat.error', 'Sorry, there was an error sending your message. Please try again or email us at support@stayneos.com.'));
      
      // Add fallback response
      const fallbackResponses = [
        t('chat.fallback.1', "For booking inquiries, please visit our properties page or use the AI concierge above."),
        t('chat.fallback.2', "For urgent matters, please email us at support@stayneos.com."),
        t('chat.fallback.3', "Our team typically responds within 2 hours during business hours (9am-6pm EST).")
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm(t('chat.clearConfirm', 'Are you sure you want to clear the chat history?'))) {
      localStorage.removeItem('neos_chat_history');
      const newSessionId = `website_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      setMessages([{
        id: 'welcome',
        text: t('chat.welcome', "Hi! I'm Aria, NEOS Customer Care. How can I help you today?"),
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  if (pathname?.startsWith('/account') || pathname?.startsWith('/property/')) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-toggle-button fixed bottom-28 right-4 z-[60] w-14 h-14 bg-[#2563eb] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-200 md:bottom-6 md:right-20 account-page:bottom-32"
        aria-label={t('chat.toggle', 'Open chat with NEOS Support')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="fixed bottom-40 right-4 z-[1001] w-[380px] h-[450px] bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 md:bottom-24 md:right-6"
          style={{
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 'calc(100vh - 120px)'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="#2563eb"
                >
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {t('chat.title', 'Chat with NEOS Support')}
                </h3>
                <p className="text-xs text-gray-500">
                  {t('chat.subtitle', 'Aria • Customer Care Lead')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClearChat}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label={t('chat.clear', 'Clear chat history')}
                title={t('chat.clear', 'Clear chat history')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
                aria-label={t('chat.close', 'Close chat')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${message.sender === 'user' ? 'text-right' : ''}`}
              >
                <div
                  className={`inline-block max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.properties && message.properties.length > 0 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {message.properties.map((property) => (
                      <ChatPropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                )}
                {message.externalProperties && message.externalProperties.length > 0 && (
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    {message.externalProperties.map((p, i) => (
                      <ChatExternalPropertyCard key={`${p.url}-${i}`} property={p} variant="light" />
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="mb-4">
                <div className="inline-block max-w-[80%] rounded-2xl rounded-bl-none bg-white border border-gray-200 px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse delay-300"></div>
                  </div>
                  <p className="text-xs mt-1 text-gray-500">
                    {t('chat.typing', 'Aria is typing...')}
                  </p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('chat.placeholder', 'Type your message...')}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t('chat.send', 'Send')}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {t('chat.disclaimer', 'Responses may take a few moments')}
            </p>
          </form>
        </div>
      )}

      {/* Mobile full-screen overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[1000]" />
      )}
    </>
  );
}

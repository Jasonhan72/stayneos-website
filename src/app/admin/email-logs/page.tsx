'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/UserContext';

interface EmailLog {
  id: string;
  booking_id: string;
  recipient: string;
  recipient_type: string;
  subject: string;
  template: string;
  status: string;
  sent_at: string;
  error_message?: string;
}

export default function AdminEmailLogsPage() {
  const { user, isAuthenticated } = useAuth();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [config, setConfig] = useState<{resendApiKeyConfigured: boolean; resendFromEmail: string; timestamp: string} | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{success: boolean; message?: string; error?: string; details?: string} | null>(null);

  // 检查是否为管理员
  const isAdmin = user?.role === 'ADMIN' || user?.email === 'hello@stayneos.com';

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchLogs();
    fetchConfig();
  }, [isAuthenticated]);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/email-logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/test/email');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Error fetching config:', err);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) return;
    
    setTestResult(null);
    try {
      const response = await fetch('/api/test/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      
      const result = await response.json();
      setTestResult(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setTestResult({ success: false, error: errorMessage });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">请先登录</h1>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-50 pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">无权限访问</h1>
            <p className="text-neutral-600">只有管理员可以访问此页面</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">邮件系统管理</h1>

        {/* 配置状态 */}
        <div className="bg-white rounded-xl p-6 mb-8 border border-neutral-200">
          <h2 className="text-xl font-semibold mb-4">邮件配置状态</h2>
          {config ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-neutral-600">Resend API Key:</span>
                <span className={config.resendApiKeyConfigured ? 'text-green-600' : 'text-red-600'}>
                  {config.resendApiKeyConfigured ? '✓ 已配置' : '✗ 未配置'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-600">发件邮箱:</span>
                <span>{config.resendFromEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neutral-600">检查时间:</span>
                <span>{new Date(config.timestamp).toLocaleString('zh-CN')}</span>
              </div>
            </div>
          ) : (
            <p className="text-neutral-500">加载中...</p>
          )}
        </div>

        {/* 测试邮件 */}
        <div className="bg-white rounded-xl p-6 mb-8 border border-neutral-200">
          <h2 className="text-xl font-semibold mb-4">发送测试邮件</h2>
          <div className="flex gap-4">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="输入测试邮箱地址"
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg"
            />
            <button
              onClick={sendTestEmail}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700"
            >
              发送测试
            </button>
          </div>
          {testResult && (
            <div className={`mt-4 p-4 rounded-lg ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {testResult.success ? (
                <p>✓ {testResult.message}</p>
              ) : (
                <div>
                  <p>✗ {testResult.error}</p>
                  {testResult.details && <p className="text-sm mt-1">{testResult.details}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 邮件日志 */}
        <div className="bg-white rounded-xl p-6 border border-neutral-200">
          <h2 className="text-xl font-semibold mb-4">邮件发送日志</h2>
          {logs.length === 0 ? (
            <p className="text-neutral-500">暂无邮件记录</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4">时间</th>
                    <th className="text-left py-3 px-4">收件人</th>
                    <th className="text-left py-3 px-4">类型</th>
                    <th className="text-left py-3 px-4">状态</th>
                    <th className="text-left py-3 px-4">主题</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-neutral-100">
                      <td className="py-3 px-4 text-sm">
                        {new Date(log.sent_at).toLocaleString('zh-CN')}
                      </td>
                      <td className="py-3 px-4 text-sm">{log.recipient}</td>
                      <td className="py-3 px-4 text-sm">{log.recipient_type}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded ${
                          log.status === 'SENT' ? 'bg-green-100 text-green-700' :
                          log.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm truncate max-w-xs">{log.subject}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

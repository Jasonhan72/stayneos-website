import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * /messages 已迁移到 /dashboard/messages
 */
export default function MessagesRedirect() {
  redirect('/dashboard/messages');
}

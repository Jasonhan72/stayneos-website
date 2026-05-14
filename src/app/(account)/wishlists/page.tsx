import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * /wishlists 已迁移到 /dashboard/wishlists
 */
export default function WishlistsRedirect() {
  redirect('/dashboard/wishlists');
}

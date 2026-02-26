// Auth layout - no additional wrappers needed since UserProvider is at root
// This allows static generation of auth pages

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

// Force static generation for auth pages in export mode
export const dynamic = "force-static";

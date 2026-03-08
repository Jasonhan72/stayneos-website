// Auth layout - no additional wrappers needed since UserProvider is at root
// This allows static generation of auth pages

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

// Allow dynamic rendering for auth pages (needed for client-side interactivity)

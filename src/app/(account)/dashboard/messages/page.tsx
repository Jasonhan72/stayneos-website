"use client";

import dynamic from "next/dynamic";

const MessagingShell = dynamic(() => import("@/components/messages/MessagingShell"), { ssr: false });

export default function MessagesPage() {
  return (
    <main className="h-[calc(100vh-64px)] overflow-hidden bg-white md:h-[calc(100vh-80px)]">
      <MessagingShell className="h-full" />
    </main>
  );
}

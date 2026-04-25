import Link from "next/link";

export default function BecomeAHostPage() {
  return (
    <main className="min-h-[70vh] bg-neutral-50 px-4 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-3xl font-semibold text-neutral-900">Coming soon</h1>
        <p className="mt-3 text-neutral-600">Host onboarding is being prepared. We’ll open it shortly.</p>
        <Link href="/" className="mt-6 inline-flex rounded-xl bg-neutral-900 px-5 py-3 text-white">Back to home</Link>
      </div>
    </main>
  );
}

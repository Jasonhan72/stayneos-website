'use client';

export default function BookingError({ reset }: { reset: () => void }) {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-3">Booking page error</h2>
      <button className="px-4 py-2 rounded bg-black text-white" onClick={() => reset()}>Retry</button>
    </div>
  );
}

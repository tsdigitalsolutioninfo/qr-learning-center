'use client';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6">
      <p className="mb-3 text-sm">Something went wrong. Please try again.</p>
      <button onClick={reset} className="btn-outline">Retry</button>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <section className="max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-950">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          The request could not be completed. No stack trace or sensitive detail
          has been exposed.
        </p>
        <Button className="mt-5" onClick={reset}>
          Try again
        </Button>
      </section>
    </main>
  );
}

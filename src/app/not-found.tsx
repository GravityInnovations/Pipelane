import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <section className="text-center">
        <p className="text-sm font-medium text-brand">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          Page not found
        </h1>
        <Link
          href="/"
          className="mt-5 inline-block text-sm font-medium text-brand hover:underline"
        >
          Return to Outreach OS
        </Link>
      </section>
    </main>
  );
}

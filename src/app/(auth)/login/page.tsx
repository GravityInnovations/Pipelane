import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/app/(auth)/login/login-form";
import { getIdentityState } from "@/server/auth/identity";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const state = await getIdentityState();
  if (state.status === "authenticated") redirect("/dashboard");
  return (
    <section className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="flex size-10 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
        GO
      </div>
      <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
        Sign in to Outreach OS
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        Use your Gravity Innovations account.
      </p>
      <LoginForm />
    </section>
  );
}

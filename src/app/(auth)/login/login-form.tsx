"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/(auth)/login/actions";
import { Button } from "@/components/ui/button";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return (
    <form action={action} className="mt-7 space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-describedby={state.errors?.email ? "email-error" : undefined}
          className="mt-1.5 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-brand focus:outline-2"
        />
        {state.errors?.email ? (
          <p id="email-error" className="mt-1 text-xs text-red-600">
            {state.errors.email[0]}
          </p>
        ) : null}
      </div>
      <div>
        <label
          htmlFor="password"
          className="text-sm font-medium text-slate-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-describedby={
            state.errors?.password ? "password-error" : undefined
          }
          className="mt-1.5 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-brand focus:outline-2"
        />
        {state.errors?.password ? (
          <p id="password-error" className="mt-1 text-xs text-red-600">
            {state.errors.password[0]}
          </p>
        ) : null}
      </div>
      {state.message ? (
        <p
          role="alert"
          className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state.message}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

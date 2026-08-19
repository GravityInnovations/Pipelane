"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password."),
});
export type LoginState = {
  message?: string;
  errors?: { email?: string[]; password?: string[] };
};

export async function loginAction(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return { message: "Email or password is incorrect." };
  } catch {
    return {
      message: "Authentication is not configured. Check the local environment.",
    };
  }
  redirect("/dashboard");
}

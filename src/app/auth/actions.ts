"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const role = formData.get("role");
  const displayName = String(formData.get("display_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (role !== "musician" && role !== "venue") return { error: "Choose musician or venue." };
  if (!displayName) return { error: "Name is required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, display_name: displayName },
      emailRedirectTo: `${origin}/auth/confirm?next=/dashboard/profile`,
    },
  });
  if (error) return { error: error.message };

  // With email confirmation disabled, a session comes back immediately.
  if (data.session) redirect("/dashboard/profile");
  return { message: "Check your email to confirm your account." };
}

export async function logIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: error.message };

  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
}

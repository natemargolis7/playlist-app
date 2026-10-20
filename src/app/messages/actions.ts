"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import type { Message } from "@/lib/types";

export async function sendMessage(applicationId: string, body: string): Promise<{ message?: Message; error?: string }> {
  const { supabase, user } = await requireSession();
  const text = body.trim();
  if (!text) return { error: "Write a message first." };
  if (text.length > 4000) return { error: "Messages can be up to 4,000 characters." };

  const { data, error } = await supabase
    .from("messages")
    .insert({ application_id: applicationId, sender_id: user.id, body: text })
    .select("*")
    .single();
  // RLS rejects senders who aren't in the conversation, or conversations that are closed.
  if (error) return { error: error.code === "42501" ? "This conversation is closed." : error.message };

  await markRead(applicationId);
  return { message: data as Message };
}

export async function markRead(applicationId: string) {
  const { supabase, user } = await requireSession();
  await supabase
    .from("conversation_reads")
    .upsert({ application_id: applicationId, user_id: user.id, last_read_at: new Date().toISOString() });
  revalidatePath("/messages");
}

export type ContactState = { error?: string; message?: string };

export async function updateContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const { supabase, user } = await requireSession();
  const email = String(formData.get("contact_email") ?? "").trim();
  const phone = String(formData.get("contact_phone") ?? "").trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (phone && !/^[\d\s()+.-]{7,20}$/.test(phone)) return { error: "Enter a valid phone number." };

  const { error } = await supabase
    .from("contact_details")
    .upsert({ user_id: user.id, email: email || null, phone: phone || null });
  if (error) return { error: error.message };

  revalidatePath("/dashboard/profile");
  return { message: "Contact details saved." };
}

"use server";

import { createServerSupabaseClient } from "./server";
import { translateSupabaseAuthError } from "./translateAuthError";
import { redirect } from "next/navigation";

export async function signUp(email: string, password: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: translateSupabaseAuthError(error.message) };
  return { error: null };
}

export async function signIn(email: string, password: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: translateSupabaseAuthError(error.message) };
  return { error: null };
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getUser() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

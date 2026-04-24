"use server";

import { createServerSupabaseClient } from "./server";
import { translateSupabaseAuthError } from "./translateAuthError";
import { redirect } from "next/navigation";

export async function signUp(email: string, password: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: translateSupabaseAuthError(error.message) };
    return { error: null };
  } catch (err) {
    console.error("[auth] signUp unexpected error:", err);
    return { error: "サインアップ中にエラーが発生しました。しばらくしてから再度お試しください。" };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: translateSupabaseAuthError(error.message) };
    return { error: null };
  } catch (err) {
    console.error("[auth] signIn unexpected error:", err);
    return { error: "ログイン中にエラーが発生しました。しばらくしてから再度お試しください。" };
  }
}

export async function signOut() {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[auth] signOut error:", err);
  }
  redirect("/login");
}

export async function getUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch (err) {
    console.error("[auth] getUser error:", err);
    return null;
  }
}

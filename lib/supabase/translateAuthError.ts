/**
 * Supabase Auth（GoTrue）が返す英語メッセージを UI 用の日本語に変換する。
 */
export function translateSupabaseAuthError(message: string | undefined): string {
  if (!message?.trim()) {
    return "エラーが発生しました。しばらくしてからお試しください。";
  }

  const lower = message.toLowerCase();

  // 「Request rate limit exceeded」はメール送信とは限らないため、文言を限定する
  if (lower.includes("email rate limit") || lower.includes("sms rate limit")) {
    return "メールの送信回数が上限に達しました。しばらく時間をおいてから再度お試しください。";
  }

  if (lower.includes("request rate limit") || lower.includes("rate limit exceeded")) {
    return "リクエストが多すぎます。しばらく時間をおいてから再度お試しください。";
  }

  if (lower.includes("for security purposes") && lower.includes("only request")) {
    return "セキュリティのため、しばらく経ってから再度お試しください。";
  }

  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid email or password") ||
    lower === "invalid credentials"
  ) {
    return "メールアドレスまたはパスワードが正しくありません。";
  }

  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "このメールアドレスは既に登録されています。";
  }

  if (lower.includes("email not confirmed") || lower.includes("confirm your email")) {
    return "メールアドレスの確認が完了していません。受信したメールのリンクから確認してください。";
  }

  if (lower.includes("signup") && lower.includes("disabled")) {
    return "現在、新規登録を受け付けていません。";
  }

  if (lower.includes("password") && lower.includes("at least")) {
    return "パスワードが短すぎます。要件を満たすパスワードを設定してください。";
  }

  if (lower.includes("invalid format") && lower.includes("email")) {
    return "メールアドレスの形式が正しくありません。";
  }

  if (lower.includes("email address not authorized")) {
    return "このメールアドレスでは登録できません。";
  }

  if (lower.includes("email link is invalid") || lower.includes("link has expired")) {
    return "リンクの有効期限が切れているか、無効です。もう一度手続きをやり直してください。";
  }

  if (lower.includes("token") && (lower.includes("expired") || lower.includes("invalid"))) {
    return "セッションの有効期限が切れています。再度ログインしてください。";
  }

  if (lower.includes("network") || lower.includes("fetch failed") || lower.includes("failed to fetch")) {
    return "通信に失敗しました。接続を確認してから再度お試しください。";
  }

  if (lower.includes("too many requests") || lower.includes("429")) {
    return "リクエストが多すぎます。しばらく時間をおいてから再度お試しください。";
  }

  if (/[\u3040-\u30ff\u3400-\u9fff]/.test(message)) {
    return message.trim();
  }

  return "処理に失敗しました。しばらくしてからお試しください。";
}

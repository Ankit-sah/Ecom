import { NextResponse } from "next/server";

/**
 * Diagnostic endpoint to check email configuration
 * Accessible at /api/email-status
 */
export async function GET() {
  const emailEnabled = process.env.EMAIL_ENABLED === "true";
  const emailProvider = process.env.EMAIL_PROVIDER || "none";
  const hasApiKey = !!process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || "not set";

  return NextResponse.json({
    emailEnabled,
    emailProvider,
    hasApiKey,
    emailFrom,
    isConfigured: emailEnabled && emailProvider === "resend" && hasApiKey,
    message: emailEnabled && emailProvider === "resend" && hasApiKey
      ? "✅ Email is properly configured"
      : "❌ Email is not configured. Add to .env: EMAIL_ENABLED=true, EMAIL_PROVIDER=resend, RESEND_API_KEY=your_key",
  });
}

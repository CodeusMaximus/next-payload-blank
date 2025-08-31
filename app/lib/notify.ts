// lib/notify.ts
import 'server-only'
import { Resend } from 'resend'

const FROM_EMAIL =
  process.env.RESEND_FROM ||
  process.env.EMAIL_FROM ||
  'orders@example.com' // fallback so build never crashes

export async function sendOrderConfirmedEmail(
  to: string,
  name: string,
  shortId: string
) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn('RESEND_API_KEY not set; skipping email send')
    return { skipped: true as const }
  }

  const resend = new Resend(key)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const trackUrl = `${baseUrl}/order/${shortId}`

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your order ${shortId} is confirmed`,
    html: `<p>Hi ${name},</p>
           <p>Your order <b>${shortId}</b> is confirmed.</p>
           <p>Track status here: <a href="${trackUrl}">${trackUrl}</a></p>`,
  })

  if (error) throw error
  return { ok: true as const }
}

// Keep the SMS API but make it a no-op for now, so callers don't have to change.
export async function sendOrderConfirmedSMS(_to: string, _shortId: string) {
  console.warn('SMS sending disabled (no Twilio configured); skipping SMS')
  return { skipped: true as const }
}

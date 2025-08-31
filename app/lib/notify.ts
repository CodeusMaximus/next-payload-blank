// lib/notify.ts
import { Resend } from 'resend'
import twilio from 'twilio'

const resend = new Resend(process.env.RESEND_API_KEY)
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function sendOrderConfirmedEmail(to: string, name: string, shortId: string) {
  const trackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/order/${shortId}`
  await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: `Your order ${shortId} is confirmed`,
    html: `<p>Hi ${name},</p><p>Your order <b>${shortId}</b> is confirmed.</p><p>Track status here: <a href="${trackUrl}">${trackUrl}</a></p>`,
  })
}

export async function sendOrderConfirmedSMS(to: string, shortId: string) {
  const trackUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/order/${shortId}`
  await twilioClient.messages.create({
    to,
    from: process.env.TWILIO_FROM_NUMBER!,
    body: `Your order ${shortId} is confirmed. Track: ${trackUrl}`,
  })
}

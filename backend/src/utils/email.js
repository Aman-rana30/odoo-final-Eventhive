import nodemailer from "nodemailer"
import { ENV } from "../config/env.js"

export function getTransporter() {
  return nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    secure: ENV.SMTP_SECURE,
    auth: ENV.SMTP_USER ? { user: ENV.SMTP_USER, pass: ENV.SMTP_PASS } : undefined,
  })
}

export async function sendBookingEmail(to, subject, html, attachments = []) {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: ENV.EMAIL_FROM,
    to,
    subject,
    html,
    attachments,
  })
}

import nodemailer from "nodemailer"

function getTransport() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const secure = String(process.env.SMTP_SECURE || "false") === "true"
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } })
}

export async function sendEmail({ to, subject, html, attachments = [] }) {
  const from = process.env.EMAIL_FROM || "no-reply@eventhive.local"
  const transporter = getTransport()
  const info = await transporter.sendMail({ from, to, subject, html, attachments })
  return info.messageId
}

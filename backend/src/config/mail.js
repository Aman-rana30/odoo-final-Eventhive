import nodemailer from "nodemailer"
import { env } from "./env.js"

export function createMailer() {
  if (!env.SMTP_HOST) {
    console.warn("[eventhive] SMTP not configured; emails disabled")
    return null
  }
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  })
}

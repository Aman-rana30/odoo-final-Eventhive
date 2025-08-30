import { env } from "./env.js"

export function sendWhatsAppMessage({ to, text }) {
  if (!env.WHATSAPP_TOKEN) {
    console.warn("[eventhive] WhatsApp not configured; skipping send", to, text)
    return { ok: false, reason: "not-configured" }
  }
  // Stub only. Integrate WhatsApp Cloud API/Twilio here.
  console.log("[eventhive] WhatsApp (stub)", { to, text })
  return { ok: true }
}

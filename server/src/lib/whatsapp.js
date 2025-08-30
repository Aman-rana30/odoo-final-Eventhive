import axios from "axios"

export async function sendWhatsAppLink({ toPhoneE164, text }) {
  if (process.env.WHATSAPP_PROVIDER !== "cloud") {
    console.log("[whatsapp] disabled or unsupported provider")
    return { ok: false }
  }
  const token = process.env.WHATSAPP_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_ID
  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`
  try {
    const res = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: toPhoneE164,
        type: "text",
        text: { body: text },
      },
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return res.data
  } catch (e) {
    console.error("[whatsapp] send error", e.response?.data || e.message)
    return { ok: false }
  }
}

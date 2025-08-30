import QRCode from "qrcode"
export async function generateQR(text) {
  return QRCode.toBuffer(text, { type: "png", errorCorrectionLevel: "M" })
}

import QRCode from "qrcode"

export async function generateQrPng(data) {
  return QRCode.toBuffer(JSON.stringify(data), { type: "png", errorCorrectionLevel: "M", margin: 1, width: 256 })
}

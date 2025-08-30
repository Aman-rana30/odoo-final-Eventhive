import PDFDocument from "pdfkit"
export function generateSimplePDF({ title = "Ticket", lines = [] }) {
  const doc = new PDFDocument({ size: "A4", margin: 48 })
  const chunks = []
  doc.on("data", (c) => chunks.push(c))
  return new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.fontSize(20).text(title)
    doc.moveDown()
    doc.fontSize(12)
    lines.forEach((l) => doc.text(String(l)))
    doc.end()
  })
}

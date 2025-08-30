import mongoose from "mongoose"

const itemSchema = new mongoose.Schema({
  ticketTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "TicketType", required: true },
  name: String,
  qty: Number,
  priceAtPurchase: Number,
})

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    items: [itemSchema],
    subtotal: Number,
    discount: Number,
    total: Number,
    payment: {
      gateway: { type: String, default: "razorpay" },
      orderId: String,
      paymentId: String,
      status: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    },
    status: { type: String, enum: ["Pending", "Paid", "Cancelled", "Refunded"], default: "Pending" },
    qrCodeUrl: String,
    pdfUrl: String,
    delivery: {
      emailed: { type: Boolean, default: false },
      whatsapped: { type: Boolean, default: false },
    },
    reminders: {
      t24hSent: { type: Boolean, default: false },
      t1hSent: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
)

export default mongoose.model("Booking", bookingSchema)

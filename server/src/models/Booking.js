import mongoose from "mongoose"

const bookingItemSchema = new mongoose.Schema(
  {
    ticketTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "TicketType" },
    qty: Number,
    priceAtPurchase: Number,
  },
  { _id: false },
)

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", index: true },
    items: [bookingItemSchema],
    subtotal: Number,
    discount: Number,
    total: Number,
    payment: {
      gateway: { type: String, default: "razorpay" },
      orderId: String,
      paymentId: String,
      status: { type: String, enum: ["Pending", "Paid", "Cancelled", "Refunded"], default: "Pending" },
      signature: String,
    },
    status: { type: String, enum: ["Pending", "Paid", "Cancelled", "Refunded"], default: "Pending" },
    qrCodeUrl: String,
    pdfUrl: String,
    delivery: {
      emailed: { type: Boolean, default: false },
      whatsapped: { type: Boolean, default: false },
    },
    reminders: {
      sent24h: { type: Boolean, default: false },
      sent1h: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
)

export const Booking = mongoose.model("Booking", bookingSchema)

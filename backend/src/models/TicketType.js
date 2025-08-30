import mongoose from "mongoose"

const ticketTypeSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    saleStartAt: { type: Date },
    saleEndAt: { type: Date },
    maxQuantity: { type: Number, required: true },
    perUserLimit: { type: Number, default: 10 },
    remainingQuantity: { type: Number, required: true },
  },
  { timestamps: true },
)

ticketTypeSchema.index({ eventId: 1, name: 1 }, { unique: true })

export default mongoose.model("TicketType", ticketTypeSchema)

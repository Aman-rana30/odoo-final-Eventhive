import mongoose from "mongoose"

const checkinSchema = new mongoose.Schema(
  {
    bookingId: { type: String, index: true },
    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", index: true },
    scannedAt: { type: Date, default: Date.now },
    deviceInfo: String,
  },
  { timestamps: true },
)

checkinSchema.index({ bookingId: 1 }, { unique: true })

export const Checkin = mongoose.model("Checkin", checkinSchema)

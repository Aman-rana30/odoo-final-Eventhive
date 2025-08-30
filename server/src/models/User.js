import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: ["Attendee"], index: true },
    loyaltyPoints: { type: Number, default: 0 },
    referralCode: { type: String, index: true },
    referredBy: { type: String },
  },
  { timestamps: true },
)

export const User = mongoose.model("User", userSchema)

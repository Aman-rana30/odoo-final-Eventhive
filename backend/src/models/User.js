import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String },
    passwordHash: { type: String, required: true },
    roles: { type: [String], default: ["Attendee"], enum: ["Admin", "EventManager", "Volunteer", "Attendee"] },
  },
  { timestamps: true },
)

export const User = mongoose.model("User", userSchema)

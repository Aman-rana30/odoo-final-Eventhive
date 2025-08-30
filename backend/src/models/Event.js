import mongoose from "mongoose"

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    category: { type: String, index: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    status: { type: String, enum: ["Draft", "Published"], default: "Draft", index: true },
    featured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
)

export const Event = mongoose.model("Event", eventSchema)

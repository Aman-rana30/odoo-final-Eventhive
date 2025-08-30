import mongoose from "mongoose"

const venueSchema = new mongoose.Schema(
  {
    address: String,
    city: String,
    state: String,
    country: String,
    lat: Number,
    lng: Number,
    type: { type: String, enum: ["Indoor", "Outdoor", "Online"], default: "Indoor" },
  },
  { _id: false },
)

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    category: { type: String, index: true },
    coverImageUrl: { type: String },
    venue: venueSchema,
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    status: { type: String, enum: ["Draft", "Published"], default: "Draft", index: true },
    featured: { type: Boolean, default: false, index: true },
    trendingScore: { type: Number, default: 0, index: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
)

export const Event = mongoose.model("Event", eventSchema)

const ticketTypeSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", index: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    saleStartAt: { type: Date, required: true },
    saleEndAt: { type: Date, required: true },
    maxQuantity: { type: Number, required: true },
    perUserLimit: { type: Number, default: 10 },
    remainingQuantity: { type: Number, required: true, index: true },
  },
  { timestamps: true },
)

ticketTypeSchema.index({ eventId: 1, name: 1 }, { unique: true })

export const TicketType = mongoose.model("TicketType", ticketTypeSchema)

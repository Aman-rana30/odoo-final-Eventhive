import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { connectDB } from "../config/db.js"
import User from "../models/User.js"
import Event from "../models/Event.js"
import TicketType from "../models/TicketType.js"
import Coupon from "../models/Coupon.js"

async function run() {
  await connectDB()
  await Promise.all([User.deleteMany({}), Event.deleteMany({}), TicketType.deleteMany({}), Coupon.deleteMany({})])

  const admin = await User.create({
    name: "Admin",
    email: "admin@eventhive.local",
    passwordHash: await bcrypt.hash("password", 10),
    roles: ["Admin"],
  })

  const org = await User.create({
    name: "Organizer",
    email: "organizer@eventhive.local",
    passwordHash: await bcrypt.hash("password", 10),
    roles: ["EventManager"],
  })

  const attendee = await User.create({
    name: "Attendee",
    email: "attendee@eventhive.local",
    passwordHash: await bcrypt.hash("password", 10),
    roles: ["Attendee"],
  })

  const start = new Date(Date.now() + 3 * 24 * 3600 * 1000)
  const end = new Date(start.getTime() + 3 * 3600 * 1000)
  const ev = await Event.create({
    title: "City Music Fest",
    slug: "city-music-fest",
    description: "A great evening of music and vibes.",
    category: "Music",
    coverImageUrl: "",
    venue: { city: "Bangalore", country: "India", type: "outdoor" },
    startAt: start,
    endAt: end,
    status: "Published",
    featured: true,
    organizer: org._id,
  })

  await TicketType.create([
    { eventId: ev._id, name: "General", price: 499, maxQuantity: 500, remainingQuantity: 500, perUserLimit: 10 },
    { eventId: ev._id, name: "VIP", price: 1499, maxQuantity: 50, remainingQuantity: 50, perUserLimit: 4 },
  ])

  await Coupon.create({
    code: "WELCOME10",
    type: "PERCENT",
    value: 10,
    minAmount: 300,
    maxDiscount: 300,
    validFrom: new Date(Date.now() - 86400000),
    validTo: new Date(Date.now() + 30 * 86400000),
    active: true,
  })

  console.log("[seed] Done. Users:", { admin: admin.email, org: org.email, attendee: attendee.email })
  await mongoose.disconnect()
}

run().catch((e) => {
  console.error("[seed] error", e)
  process.exit(1)
})

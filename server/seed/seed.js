import "../src/config/index.js"
import { connectDB } from "../src/db.js"
import { User } from "../src/models/User.js"
import { Event, TicketType } from "../src/models/Event.js"
import { Coupon } from "../src/models/Coupon.js"
import bcrypt from "bcryptjs"

async function run() {
  await connectDB()

  await Promise.all([User.deleteMany({}), Event.deleteMany({}), TicketType.deleteMany({}), Coupon.deleteMany({})])

  const [admin, organizer, volunteer, attendee] = await User.create([
    {
      name: "Admin",
      email: "admin@eventhive.local",
      passwordHash: await bcrypt.hash("password", 10),
      roles: ["Admin"],
    },
    {
      name: "Organizer",
      email: "org@eventhive.local",
      passwordHash: await bcrypt.hash("password", 10),
      roles: ["EventManager"],
    },
    {
      name: "Volunteer",
      email: "vol@eventhive.local",
      passwordHash: await bcrypt.hash("password", 10),
      roles: ["Volunteer"],
    },
    {
      name: "Attendee",
      email: "att@eventhive.local",
      passwordHash: await bcrypt.hash("password", 10),
      roles: ["Attendee"],
    },
  ])

  const categories = ["Music", "Tech", "Sports", "Theatre", "Food", "Business"]

  const events = []
  for (let i = 0; i < 6; i++) {
    const start = new Date(Date.now() + (i + 1) * 86400000)
    const end = new Date(start.getTime() + 3 * 3600000)
    const e = await Event.create({
      title: `Sample ${categories[i]} Event`,
      slug: `sample-${categories[i].toLowerCase()}-${i}`,
      description: "An awesome event.",
      category: categories[i],
      coverImageUrl: "",
      venue: { address: "123 Main St", city: "Bengaluru", state: "KA", country: "IN", type: "Indoor" },
      startAt: start,
      endAt: end,
      status: "Published",
      featured: i % 2 === 0,
      organizer: organizer._id,
      trendingScore: Math.floor(Math.random() * 100),
    })
    events.push(e)
    await TicketType.create([
      {
        eventId: e._id,
        name: "General",
        price: 499,
        saleStartAt: new Date(Date.now() - 86400000),
        saleEndAt: new Date(Date.now() + 10 * 86400000),
        maxQuantity: 200,
        remainingQuantity: 200,
        perUserLimit: 10,
      },
      {
        eventId: e._id,
        name: "VIP",
        price: 1499,
        saleStartAt: new Date(Date.now() - 86400000),
        saleEndAt: new Date(Date.now() + 10 * 86400000),
        maxQuantity: 50,
        remainingQuantity: 50,
        perUserLimit: 4,
      },
    ])
  }

  await Coupon.create([
    { code: "EARLY10", type: "EARLY_BIRD", value: 10, active: true, validTo: new Date(Date.now() + 3 * 86400000) },
    { code: "OFF15", type: "PERCENT", value: 15, active: true, maxDiscount: 500 },
    { code: "LESS100", type: "FIXED", value: 100, active: true },
    { code: "GROUP6", type: "GROUP", value: 6, active: true }, // buy 5 get 1
    { code: "BOGO", type: "BOGO", value: 2, active: true },
  ])

  console.log("[seed] Done")
  process.exit(0)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})

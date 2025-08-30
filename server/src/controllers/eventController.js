import { Event } from "../models/Event.js"
import { TicketType } from "../models/Event.js"
import createError from "http-errors"

export async function list(req, res) {
  const {
    q,
    category,
    city,
    featured,
    status = "Published",
    sort = "startAt",
    order = "asc",
    page = 1,
    limit = 12,
  } = req.query

  const filter = {}
  if (status) filter.status = status
  if (category) filter.category = category
  if (typeof featured !== "undefined") filter.featured = featured === "true"
  if (q) filter.title = { $regex: q, $options: "i" }
  if (city) filter["venue.city"] = { $regex: city, $options: "i" }

  const skip = (Number(page) - 1) * Number(limit)
  const docs = await Event.find(filter)
    .sort({ [sort]: order === "desc" ? -1 : 1 })
    .skip(skip)
    .limit(Number(limit))
    .lean()
  const total = await Event.countDocuments(filter)
  res.json({ data: docs, total, page: Number(page), limit: Number(limit) })
}

export async function featured(_req, res) {
  const docs = await Event.find({ status: "Published", featured: true }).sort({ startAt: 1 }).limit(12).lean()
  res.json(docs)
}

export async function trending(_req, res) {
  const docs = await Event.find({ status: "Published" }).sort({ trendingScore: -1 }).limit(12).lean()
  res.json(docs)
}

export async function getBySlug(req, res, next) {
  const event = await Event.findOne({ slug: req.params.slug }).lean()
  if (!event) return next(createError(404, "Event not found"))
  const tickets = await TicketType.find({ eventId: event._id }).lean()
  res.json({ event, tickets })
}

export async function create(req, res) {
  const { title, slug, description, category, coverImageUrl, venue, startAt, endAt, featured } = req.body
  const exists = await Event.findOne({ slug })
  if (exists) return res.status(400).json({ error: "Slug already exists" })
  const event = await Event.create({
    title,
    slug,
    description,
    category,
    coverImageUrl,
    venue,
    startAt,
    endAt,
    featured: !!featured,
    organizer: req.user.sub,
    status: "Draft",
  })
  res.status(201).json(event)
}

export async function update(req, res) {
  const event = await Event.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
  if (!event) return res.status(404).json({ error: "Event not found" })
  res.json(event)
}

export async function publish(req, res) {
  const event = await Event.findByIdAndUpdate(req.params.id, { $set: { status: "Published" } }, { new: true })
  if (!event) return res.status(404).json({ error: "Event not found" })
  res.json(event)
}

import { Event } from "../models/Event.js"

export const eventRepo = {
  list: (filter, { skip, limit }) => Event.find(filter).sort({ startAt: 1 }).skip(skip).limit(limit),
  count: (filter) => Event.countDocuments(filter),
  bySlug: (slug) => Event.findOne({ slug }),
  create: (data) => Event.create(data),
}

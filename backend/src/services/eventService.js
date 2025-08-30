import { eventRepo } from "../repositories/eventRepo.js"

export const eventService = {
  async list({ q, status, featured, page = 1, limit = 10 }) {
    const filter = {}
    if (status) filter.status = status
    if (featured === "true") filter.featured = true
    if (q) filter.title = { $regex: q, $options: "i" }
    const skip = (Number(page) - 1) * Number(limit)
    const [data, total] = await Promise.all([
      eventRepo.list(filter, { skip, limit: Number(limit) }),
      eventRepo.count(filter),
    ])
    return { data, page: Number(page), limit: Number(limit), total }
  },
  bySlug: (slug) => eventRepo.bySlug(slug),
  create: (data) => eventRepo.create(data),
}

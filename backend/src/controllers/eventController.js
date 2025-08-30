import Joi from "joi"
import { eventService } from "../services/eventService.js"

const createSchema = Joi.object({
  title: Joi.string().required(),
  slug: Joi.string().token().required(),
  description: Joi.string().allow(""),
  category: Joi.string().allow(""),
  startAt: Joi.date().required(),
  endAt: Joi.date().required(),
  status: Joi.string().valid("Draft", "Published").default("Draft"),
  featured: Joi.boolean().default(false),
})

export const eventController = {
  async list(req, res, next) {
    try {
      const result = await eventService.list(req.query)
      res.json(result)
    } catch (e) {
      next(e)
    }
  },
  async bySlug(req, res, next) {
    try {
      const doc = await eventService.bySlug(req.params.slug)
      if (!doc) return res.status(404).json({ error: "Event not found" })
      res.json({ data: doc })
    } catch (e) {
      next(e)
    }
  },
  async create(req, res, next) {
    try {
      const payload = await createSchema.validateAsync(req.body)
      const doc = await eventService.create(payload)
      res.status(201).json({ data: doc })
    } catch (e) {
      next(e)
    }
  },
}

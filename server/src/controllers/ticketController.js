import { TicketType } from "../models/Event.js"

export async function listByEvent(req, res) {
  const docs = await TicketType.find({ eventId: req.params.eventId }).lean()
  res.json(docs)
}

export async function create(req, res) {
  const t = await TicketType.create({
    eventId: req.params.eventId,
    name: req.body.name,
    price: req.body.price,
    saleStartAt: req.body.saleStartAt,
    saleEndAt: req.body.saleEndAt,
    maxQuantity: req.body.maxQuantity,
    perUserLimit: req.body.perUserLimit || 10,
    remainingQuantity: req.body.maxQuantity,
  })
  res.status(201).json(t)
}

export async function update(req, res) {
  const t = await TicketType.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
  if (!t) return res.status(404).json({ error: "Ticket type not found" })
  res.json(t)
}

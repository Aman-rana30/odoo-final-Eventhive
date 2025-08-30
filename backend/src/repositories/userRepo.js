import { User } from "../models/User.js"

export const userRepo = {
  findByEmail: (email) => User.findOne({ email }),
  create: (data) => User.create(data),
}

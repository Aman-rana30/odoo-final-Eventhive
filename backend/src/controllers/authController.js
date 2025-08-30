import Joi from "joi"
import { authService } from "../services/authService.js"

const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
})

export const authController = {
  async register(req, res, next) {
    try {
      const data = await registerSchema.validateAsync(req.body)
      const result = await authService.register(data)
      res.status(201).json(result)
    } catch (e) {
      next(e)
    }
  },
  async login(req, res, next) {
    try {
      const data = await loginSchema.validateAsync(req.body)
      const result = await authService.login(data)
      res.json(result)
    } catch (e) {
      next(e)
    }
  },
}

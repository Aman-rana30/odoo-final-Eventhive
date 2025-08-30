import request from "supertest"
import { app } from "../../src/app.js"

describe("auth api", () => {
  test("register -> login", async () => {
    const email = `user${Math.random().toString(36).slice(2)}@test.local`
    const reg = await request(app).post("/api/auth/register").send({ name: "U", email, password: "password" })
    expect(reg.status).toBe(201)
    const login = await request(app).post("/api/auth/login").send({ email, password: "password" })
    expect(login.status).toBe(200)
    expect(login.body.tokens?.access).toBeTruthy()
  })
})

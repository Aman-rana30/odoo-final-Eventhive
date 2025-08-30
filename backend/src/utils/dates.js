import dayjs from "dayjs"
export const dt = {
  fmt: (d) => dayjs(d).format("YYYY-MM-DD HH:mm"),
  addHours: (d, h) => dayjs(d).add(h, "hour").toDate(),
}

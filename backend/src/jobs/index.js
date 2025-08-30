import cron from "node-cron"
export function startCronJobs() {
  cron.schedule("0 * * * *", () => {
    console.log("[eventhive] hourly cron tick")
  })
}

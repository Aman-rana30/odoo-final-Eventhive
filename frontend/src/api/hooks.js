import { useQuery } from "@tanstack/react-query"
import { api } from "./client"

export function useEvents(params = {}) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: async () => {
      const { data } = await api.get("/api/events", { params })
      return data
    },
  })
}

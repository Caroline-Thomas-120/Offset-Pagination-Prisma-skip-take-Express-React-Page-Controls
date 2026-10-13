import apiClient from "./apiClient";

export async function getThreads({ search, sort, page = 1 }) {
  const res = await apiClient.get("/api/threads", {
    params: { search, sort, page },
  });

  return res.data;
}
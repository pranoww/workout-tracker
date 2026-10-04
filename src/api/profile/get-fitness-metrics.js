import { apiClient } from "../client";

export const getFitnessMetrics = async () => {
  return apiClient("/profile/fitness-metrics", { method: "GET" });
};

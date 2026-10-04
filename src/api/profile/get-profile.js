import { apiClient } from "../client";

export const getProfile = async () => {
  return apiClient("/profile", { method: "GET" });
};

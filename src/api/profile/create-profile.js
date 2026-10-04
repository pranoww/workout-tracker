import { apiClient } from "../client";

export const createProfile = async (data) => {
  return apiClient("/profile", {
    method: "POST",
    body: data,
  });
};

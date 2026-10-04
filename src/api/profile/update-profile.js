import { apiClient } from "../client";

export const updateProfile = async (data) => {
  return apiClient("/profile", {
    method: "PATCH",
    body: data,
  });
};

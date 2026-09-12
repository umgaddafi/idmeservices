import axios from "axios";
import { API_BASE_URL } from "./appData.js";

const API_REQUEST_TIMEOUT_MS = 15000;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_REQUEST_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
  },
});

export async function apiRequest(path, { method = "GET", token, body, params } = {}) {
  try {
    const response = await apiClient.request({
      url: path,
      method,
      data: body,
      params,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log(`[API] ${method} ${path}`, {
      status: response.status,
      ok: true,
      data: response.data,
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        throw new Error(`The request to ${API_BASE_URL}${path} timed out. Please try again.`);
      }

      if (error.response) {
        const payload = error.response.data;
        const message = payload?.message || Object.values(payload?.errors || {}).flat().join(" ") || "Request failed.";
        throw new Error(message);
      }
    }

    throw new Error(`Unable to reach the backend API at ${API_BASE_URL}.`);
  }
}

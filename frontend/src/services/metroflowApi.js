import axios from "axios";
import { AUTH_STORAGE_KEY } from "@/constants";

// ============================================================
// API BASE URL (/api prefix required by FastAPI)
// ============================================================

const RAW_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

const API_BASE_URL = RAW_URL.endsWith("/api")
  ? RAW_URL
  : `${RAW_URL.replace(/\/+$/, "")}/api`;

// ============================================================
// AXIOS INSTANCE
// ============================================================

const metroflowApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Add token interceptor if present
metroflowApi.interceptors.request.use((config) => {
  try {
    const key = AUTH_STORAGE_KEY || "metroflow_auth_v2";
    const local = localStorage.getItem(key);
    const session = local || sessionStorage.getItem(key);
    if (session) {
      const parsed = JSON.parse(session);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch (e) {
    // Ignore error
  }
  return config;
});

// ============================================================
// AUTHENTICATION APIS
// ============================================================

export const loginApi = async (credentials) => {
  const response = await metroflowApi.post("/auth/login", {
    email: credentials.email,
    password: credentials.password,
  });
  return response.data;
};

export const socialLoginApi = async (payload) => {
  const response = await metroflowApi.post("/auth/social-login", {
    provider: payload.provider,
    email: payload.email,
    name: payload.name || "",
    phone: payload.phone || "",
    profileImage: payload.profileImage || null,
    providerId: payload.providerId || null,
    rememberMe: payload.rememberMe !== false,
  });
  return response.data;
};

export const registerApi = async (details) => {
  const response = await metroflowApi.post("/auth/register", {
    name: details.name,
    email: details.email,
    password: details.password,
    phone: details.phone || "",
    profileImage: details.profileImage || null,
  });
  return response.data;
};

export const updateProfileApi = async (userId, patch) => {
  const response = await metroflowApi.put(`/auth/profile/${userId}`, patch);
  return response.data;
};

export const changePasswordApi = async (userId, payload) => {
  const response = await metroflowApi.post(`/auth/change-password?user_id=${userId}`, payload);
  return response.data;
};

// ============================================================
// GET STATIONS
// ============================================================

export const getStations = async (city = null) => {
  try {
    const params = {};
    if (city) {
      params.city_id = String(city).toLowerCase().replace(/\s+metro$/i, "");
    }
    const response = await metroflowApi.get("/stations", { params });
    return response.data;
  } catch (error) {
    console.error("Failed to load stations:", error);
    throw error;
  }
};

// ============================================================
// CITIES & FULL DATA
// ============================================================

export const getFullCityData = async (cityId) => {
  try {
    const normalized = String(cityId).toLowerCase().replace(/\s+metro$/i, "");
    const response = await metroflowApi.get(`/cities/${normalized}/full-data`);
    return response.data;
  } catch (error) {
    console.error("Failed to load full city data:", error);
    throw error;
  }
};

// ============================================================
// GET METRO PREDICTION (STATION ML OCCUPANCY)
// ============================================================

export const getMetroPrediction = async (stationId) => {
  try {
    const response = await metroflowApi.post("/predict", { station_id: stationId, stationId });
    return response.data;
  } catch (error) {
    try {
      const fallbackResponse = await metroflowApi.get(`/ai/predict/${stationId}`);
      return fallbackResponse.data;
    } catch (err) {
      console.error("Prediction failed for station:", stationId, error);
      throw error;
    }
  }
};

export const getCityAiPredictions = async (cityId) => {
  try {
    const normalized = String(cityId).toLowerCase().replace(/\s+metro$/i, "");
    const response = await metroflowApi.get(`/ai/predictions/${normalized}`);
    return response.data;
  } catch (error) {
    console.error("City prediction failed for:", cityId, error);
    throw error;
  }
};

// ============================================================
// HEALTH CHECK
// ============================================================

export const checkBackendHealth = async () => {
  try {
    const rootUrl = API_BASE_URL.replace(/\/api\/?$/, "");
    const response = await axios.get(`${rootUrl}/`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.error("Backend health check failed:", error);
    throw error;
  }
};

export default metroflowApi;

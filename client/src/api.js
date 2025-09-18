import axios from "axios";

let accessToken = null;
let user = null;

export const api = axios.create({
  baseURL: "http://localhost:5000",
  withCredentials: true,
});

const authSubs = new Set();
export function subscribeAuth(fn) {
  authSubs.add(fn);
  return () => authSubs.delete(fn);
}
function notifyAuth() {
  for (const fn of Array.from(authSubs)) {
    try { fn(user); } catch {}
  }
}

export function setAccessToken(t) { accessToken = t || null; }
export function getUser() { return user; }
export function setUser(u) {
  user = u || null;
  if (u) localStorage.setItem("user", JSON.stringify(u));
  else localStorage.removeItem("user");
  notifyAuth();
}
export function clearAuth() {
  accessToken = null;
  user = null;
  localStorage.removeItem("user");
  localStorage.removeItem("hasRefresh");
  notifyAuth();
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});


let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config || {};
    const status = err.response?.status;

    const url = original.url || "";
    const isAuthUrl =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    if (status === 401 && !original._retry && !isAuthUrl) {
      original._retry = true;
      try {
        refreshing = refreshing || api.post("/auth/refresh");
        const { data } = await refreshing;
        refreshing = null;

        setAccessToken(data.accessToken);
        setUser(data.user);

        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        refreshing = null;
        clearAuth();
      }
    }

    return Promise.reject(err);
  }
);


export async function bootstrapAuth() {
  const cached = localStorage.getItem("user");
  if (cached) {
    try { user = JSON.parse(cached) || null; } catch { user = null; }
  }

  const hasRefresh = localStorage.getItem("hasRefresh") === "1";
  if (!hasRefresh) return;

  try {
    const { data } = await api.post("/auth/refresh");
    setAccessToken(data.accessToken);
    setUser(data.user);
  } catch {
    clearAuth();
  }
}
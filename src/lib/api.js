const API_BASE_URL = "http://127.0.0.1:9090";
const ADMIN_TOKEN = "dev-admin-token-1";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "x-admin-token": ADMIN_TOKEN,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.error || payload?.message || "Request failed";
    throw new Error(message);
  }

  return payload;
}

function qs(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

const actorHeaders = {
  "x-admin-actor": "ui-operator",
};

export const api = {
  getMetrics: () => request("/v1/admin/metrics"),
  getEvents: (limit = 10, offset = 0) =>
    request(`/v1/admin/events/recent?limit=${limit}&offset=${offset}`),
  searchEvents: (params = {}) =>
    request(`/v1/admin/events/search${qs(params)}`),
  getMitigations: () => request("/v1/admin/mitigations/active"),
  getAudits: (limit = 10, offset = 0) =>
    request(`/v1/admin/audits/recent?limit=${limit}&offset=${offset}`),
  getReputations: () => request("/v1/admin/reputations"),
  getPolicy: () => request("/v1/admin/policy/effective"),

  unblockIp: (ip) =>
    request(`/v1/admin/mitigations/unblock/${encodeURIComponent(ip)}`, {
      method: "POST",
      headers: actorHeaders,
    }),

  manualBlockIp: ({ source_ip, ttl_secs, reason }) =>
    request("/v1/admin/mitigations/block", {
      method: "POST",
      headers: actorHeaders,
      body: JSON.stringify({ source_ip, ttl_secs, reason }),
    }),

  resetReputation: (ip) =>
    request(`/v1/admin/reputations/reset/${encodeURIComponent(ip)}`, {
      method: "POST",
      headers: actorHeaders,
    }),

  setGlobalRuleMode: ({ rule_id, mode }) =>
    request("/v1/admin/policy/rules/set", {
      method: "POST",
      headers: actorHeaders,
      body: JSON.stringify({ rule_id, mode }),
    }),

  upsertRouteOverride: ({ path_prefix, rule_modes }) =>
    request("/v1/admin/policy/routes/upsert", {
      method: "POST",
      headers: actorHeaders,
      body: JSON.stringify({ path_prefix, rule_modes }),
    }),

  deleteRouteOverride: ({ path_prefix }) =>
    request("/v1/admin/policy/routes/delete", {
      method: "POST",
      headers: actorHeaders,
      body: JSON.stringify({ path_prefix }),
    }),

  upsertRouteRateLimit: ({ path_prefix, requests_per_window, window_secs }) =>
    request("/v1/admin/policy/rate-limits/upsert", {
      method: "POST",
      headers: actorHeaders,
      body: JSON.stringify({ path_prefix, requests_per_window, window_secs }),
    }),

  deleteRouteRateLimit: ({ path_prefix }) =>
    request("/v1/admin/policy/rate-limits/delete", {
      method: "POST",
      headers: actorHeaders,
      body: JSON.stringify({ path_prefix }),
    }),
};
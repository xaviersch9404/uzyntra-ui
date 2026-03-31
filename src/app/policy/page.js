"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import SectionCard from "@/components/SectionCard";
import Badge from "@/components/Badge";
import { modeClasses } from "@/lib/format";

export default function PolicyPage() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [globalRule, setGlobalRule] = useState({
    rule_id: "",
    mode: "detect_only",
  });

  const [routeOverride, setRouteOverride] = useState({
    path_prefix: "",
    rule_id: "",
    mode: "detect_only",
  });

  const [rateLimit, setRateLimit] = useState({
    path_prefix: "",
    requests_per_window: 10,
    window_secs: 60,
  });

  async function load() {
    setLoading(true);
    setError("");

    try {
      const res = await api.getPolicy();
      setPolicy(res?.data || null);
    } catch (err) {
      setError(err.message || "Failed to load policy");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSetGlobalRule(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.setGlobalRuleMode(globalRule);
      setMessage(`Updated global rule ${globalRule.rule_id} to ${globalRule.mode}.`);
      setGlobalRule({
        rule_id: "",
        mode: "detect_only",
      });
      await load();
    } catch (err) {
      setError(err.message || "Failed to update global rule");
    }
  }

  async function handleUpsertRouteOverride(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.upsertRouteOverride({
        path_prefix: routeOverride.path_prefix,
        rule_modes: {
          [routeOverride.rule_id]: routeOverride.mode,
        },
      });

      setMessage(
        `Route override updated for ${routeOverride.path_prefix} (${routeOverride.rule_id} → ${routeOverride.mode}).`
      );

      setRouteOverride({
        path_prefix: "",
        rule_id: "",
        mode: "detect_only",
      });

      await load();
    } catch (err) {
      setError(err.message || "Failed to upsert route override");
    }
  }

  async function handleDeleteRouteOverride(path_prefix) {
    setError("");
    setMessage("");

    try {
      await api.deleteRouteOverride({ path_prefix });
      setMessage(`Route override removed for ${path_prefix}.`);
      await load();
    } catch (err) {
      setError(err.message || "Failed to delete route override");
    }
  }

  async function handleUpsertRateLimit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.upsertRouteRateLimit({
        path_prefix: rateLimit.path_prefix,
        requests_per_window: Number(rateLimit.requests_per_window),
        window_secs: Number(rateLimit.window_secs),
      });

      setMessage(`Rate limit updated for ${rateLimit.path_prefix}.`);

      setRateLimit({
        path_prefix: "",
        requests_per_window: 10,
        window_secs: 60,
      });

      await load();
    } catch (err) {
      setError(err.message || "Failed to upsert rate limit");
    }
  }

  async function handleDeleteRateLimit(path_prefix) {
    setError("");
    setMessage("");

    try {
      await api.deleteRouteRateLimit({ path_prefix });
      setMessage(`Rate limit removed for ${path_prefix}.`);
      await load();
    } catch (err) {
      setError(err.message || "Failed to delete rate limit");
    }
  }

  const globalRuleModes = policy?.global_rule_modes || {};
  const routeOverrides = policy?.route_overrides || [];
  const routeRateLimits = policy?.route_rate_limits || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Policy</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and manage live operator policy settings
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      <SectionCard
        title="Effective Policy"
        right={
          <button
            onClick={load}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Refresh
          </button>
        }
      >
        {loading ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              title="Global Rules"
              value={Object.keys(globalRuleModes).length}
            />
            <StatCard
              title="Route Overrides"
              value={routeOverrides.length}
            />
            <StatCard
              title="Rate Limits"
              value={routeRateLimits.length}
            />
          </div>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard title="Set Global Rule Mode">
          <form onSubmit={handleSetGlobalRule} className="space-y-4">
            <Field
              label="Rule ID"
              value={globalRule.rule_id}
              onChange={(e) =>
                setGlobalRule((prev) => ({ ...prev, rule_id: e.target.value }))
              }
              placeholder="ssrf.basic"
              required
            />

            <SelectField
              label="Mode"
              value={globalRule.mode}
              onChange={(e) =>
                setGlobalRule((prev) => ({ ...prev, mode: e.target.value }))
              }
              options={["detect_only", "recommend", "block"]}
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700"
            >
              Update Global Rule
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Upsert Route Override">
          <form onSubmit={handleUpsertRouteOverride} className="space-y-4">
            <Field
              label="Path Prefix"
              value={routeOverride.path_prefix}
              onChange={(e) =>
                setRouteOverride((prev) => ({
                  ...prev,
                  path_prefix: e.target.value,
                }))
              }
              placeholder="/proxy/get"
              required
            />

            <Field
              label="Rule ID"
              value={routeOverride.rule_id}
              onChange={(e) =>
                setRouteOverride((prev) => ({
                  ...prev,
                  rule_id: e.target.value,
                }))
              }
              placeholder="xss.basic"
              required
            />

            <SelectField
              label="Mode"
              value={routeOverride.mode}
              onChange={(e) =>
                setRouteOverride((prev) => ({ ...prev, mode: e.target.value }))
              }
              options={["detect_only", "recommend", "block"]}
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700"
            >
              Save Route Override
            </button>
          </form>
        </SectionCard>

        <SectionCard title="Upsert Route Rate Limit">
          <form onSubmit={handleUpsertRateLimit} className="space-y-4">
            <Field
              label="Path Prefix"
              value={rateLimit.path_prefix}
              onChange={(e) =>
                setRateLimit((prev) => ({
                  ...prev,
                  path_prefix: e.target.value,
                }))
              }
              placeholder="/proxy/login"
              required
            />

            <Field
              label="Requests Per Window"
              type="number"
              value={rateLimit.requests_per_window}
              onChange={(e) =>
                setRateLimit((prev) => ({
                  ...prev,
                  requests_per_window: e.target.value,
                }))
              }
              required
            />

            <Field
              label="Window Seconds"
              type="number"
              value={rateLimit.window_secs}
              onChange={(e) =>
                setRateLimit((prev) => ({
                  ...prev,
                  window_secs: e.target.value,
                }))
              }
              required
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700"
            >
              Save Rate Limit
            </button>
          </form>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard title="Global Rule Modes">
          {Object.keys(globalRuleModes).length === 0 ? (
            <EmptyState text="No global rule modes found" />
          ) : (
            <div className="space-y-3">
              {Object.entries(globalRuleModes).map(([ruleId, mode]) => (
                <div
                  key={ruleId}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <span className="text-sm font-medium text-slate-900">{ruleId}</span>
                  <Badge className={modeClasses(mode)}>{mode}</Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Route Overrides">
          {routeOverrides.length === 0 ? (
            <EmptyState text="No route overrides found" />
          ) : (
            <div className="space-y-4">
              {routeOverrides.map((item) => (
                <div
                  key={item.path_prefix}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{item.path_prefix}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(item.rule_modes || {}).map(([ruleId, mode]) => (
                          <div
                            key={`${item.path_prefix}-${ruleId}`}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            <span className="mr-2 text-slate-900">{ruleId}</span>
                            <Badge className={modeClasses(mode)}>{mode}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteRouteOverride(item.path_prefix)}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Route Rate Limits">
        {routeRateLimits.length === 0 ? (
          <EmptyState text="No route rate limits found" />
        ) : (
          <div className="space-y-4">
            {routeRateLimits.map((item) => (
              <div
                key={item.path_prefix}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.path_prefix}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.requests_per_window} requests / {item.window_secs} seconds
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteRateLimit(item.path_prefix)}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
      />
    </label>
  );
}

function SelectField({ label, options, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
      {text}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
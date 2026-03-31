"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatTimestamp } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import EmptyState from "@/components/EmptyState";

export default function MitigationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    source_ip: "",
    ttl_secs: 300,
    reason: "",
  });

  async function load() {
    setLoading(true);
    setError("");

    try {
      const res = await api.getMitigations();
      setItems(res?.data?.items || []);
    } catch (err) {
      setError(err.message || "Failed to load mitigations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUnblock(ip) {
    const confirmed = window.confirm(`Unblock source ${ip}?`);
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.unblockIp(ip);
      setMessage(`Source ${ip} was unblocked successfully.`);
      await load();
    } catch (err) {
      setError(err.message || "Failed to unblock source");
    }
  }

  async function handleManualBlock(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.manualBlockIp({
        source_ip: form.source_ip,
        ttl_secs: Number(form.ttl_secs),
        reason: form.reason,
      });

      setMessage(`Manual block applied to ${form.source_ip}.`);
      setForm({
        source_ip: "",
        ttl_secs: 300,
        reason: "",
      });

      await load();
    } catch (err) {
      setError(err.message || "Failed to apply manual block");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mitigations"
        subtitle="Manage active source blocks and apply manual operator actions across the control plane"
        actions={
          <button onClick={load} className="btn-primary">
            Refresh
          </button>
        }
      />

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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Active Mitigations">
          {loading ? (
            <div className="text-sm text-slate-500">Loading...</div>
          ) : items.length === 0 ? (
            <EmptyState title="No active mitigations" text="No active source blocks are currently applied." />
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.action_id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-2">
                      <p className="text-base font-semibold text-slate-900">
                        {item.source_ip}
                      </p>
                      <p className="text-sm text-slate-700">{item.reason}</p>
                      <div className="grid grid-cols-1 gap-2 text-xs text-slate-500 md:grid-cols-2">
                        <p>Created: {formatTimestamp(item.created_at)}</p>
                        <p>Expires: {formatTimestamp(item.expires_at)}</p>
                      </div>
                    </div>

                    <div>
                      <button
                        onClick={() => handleUnblock(item.source_ip)}
                        className="btn-danger"
                      >
                        Unblock
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Manual Block">
          <form onSubmit={handleManualBlock} className="space-y-4">
            <Field
              label="Source IP"
              value={form.source_ip}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, source_ip: e.target.value }))
              }
              placeholder="127.0.0.1"
              required
            />

            <Field
              label="TTL Seconds"
              type="number"
              value={form.ttl_secs}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, ttl_secs: e.target.value }))
              }
              placeholder="300"
              required
            />

            <Field
              label="Reason"
              value={form.reason}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="manual analyst block"
              required
            />

            <button type="submit" className="btn-primary w-full">
              Apply Manual Block
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input {...props} className="input-ui" />
    </label>
  );
}
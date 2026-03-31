"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatTimestamp } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import EmptyState from "@/components/EmptyState";

export default function ReputationPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const res = await api.getReputations();
      setItems(res?.data?.items || []);
    } catch (err) {
      setError(err.message || "Failed to load reputation data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReset(ip) {
    const confirmed = window.confirm(`Reset reputation for ${ip}?`);
    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.resetReputation(ip);
      setMessage(`Reputation reset for ${ip}.`);
      await load();
    } catch (err) {
      setError(err.message || "Failed to reset reputation");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reputation"
        subtitle="Review suspicious source scores and clear entries after operator verification"
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

      <SectionCard title="Source Reputation">
        {loading ? (
          <div className="text-sm text-slate-500">Loading...</div>
        ) : items.length === 0 ? (
          <EmptyState title="No reputation entries" text="No suspicious sources are currently tracked." />
        ) : (
          <div className="table-wrap">
            <table className="table-ui">
              <thead>
                <tr>
                  <th>Source IP</th>
                  <th>Suspicious Score</th>
                  <th>Last Seen</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.source_ip}>
                    <td>{item.source_ip}</td>
                    <td>
                      <ScoreBadge score={item.suspicious_score} />
                    </td>
                    <td>{formatTimestamp(item.last_seen_at)}</td>
                    <td>
                      <button
                        onClick={() => handleReset(item.source_ip)}
                        className="btn-secondary"
                      >
                        Reset Reputation
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function ScoreBadge({ score }) {
  const value = Number(score || 0);

  let classes = "bg-sky-100 text-sky-700 ring-1 ring-sky-200";
  if (value >= 12) {
    classes = "bg-red-100 text-red-700 ring-1 ring-red-200";
  } else if (value >= 6) {
    classes = "bg-orange-100 text-orange-700 ring-1 ring-orange-200";
  } else if (value >= 3) {
    classes = "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>
      {value}
    </span>
  );
}
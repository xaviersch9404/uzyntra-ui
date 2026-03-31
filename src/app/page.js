"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { formatTimestamp, severityClasses } from "@/lib/format";
import Badge from "@/components/Badge";
import MetricCard from "@/components/MetricCard";
import PageHeader from "@/components/PageHeader";
import SectionCard from "@/components/SectionCard";
import SimpleTable from "@/components/SimpleTable";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [events, setEvents] = useState([]);
  const [mitigations, setMitigations] = useState([]);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      const [metricsRes, eventsRes, mitigationsRes, auditsRes] = await Promise.all([
        api.getMetrics(),
        api.getEvents(5, 0),
        api.getMitigations(),
        api.getAudits(5, 0),
      ]);

      setMetrics(metricsRes.data);
      setEvents(eventsRes.data?.items || []);
      setMitigations(mitigationsRes.data?.items || []);
      setAudits(auditsRes.data?.items || []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const eventColumns = useMemo(
    () => [
      {
        key: "timestamp",
        label: "Time",
        render: (row) => formatTimestamp(row.timestamp),
      },
      { key: "source_ip", label: "Source IP" },
      { key: "method", label: "Method" },
      { key: "path", label: "Path" },
      {
        key: "rule",
        label: "Rule",
        render: (row) => row.findings?.[0]?.rule_id || "—",
      },
      {
        key: "severity",
        label: "Severity",
        render: (row) => {
          const severity = row.findings?.[0]?.severity;
          return severity ? (
            <Badge className={severityClasses(severity)}>{severity}</Badge>
          ) : (
            "—"
          );
        },
      },
    ],
    []
  );

  const mitigationColumns = useMemo(
    () => [
      { key: "source_ip", label: "Source IP" },
      { key: "reason", label: "Reason" },
      {
        key: "created_at",
        label: "Created",
        render: (row) => formatTimestamp(row.created_at),
      },
      {
        key: "expires_at",
        label: "Expires",
        render: (row) => formatTimestamp(row.expires_at),
      },
    ],
    []
  );

  const auditColumns = useMemo(
    () => [
      {
        key: "timestamp",
        label: "Time",
        render: (row) => formatTimestamp(row.timestamp),
      },
      { key: "actor", label: "Actor" },
      { key: "action", label: "Action" },
      { key: "target", label: "Target" },
      { key: "result", label: "Result" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Live overview of UZYNTRA operator telemetry, active controls, and security activity"
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Active Blocks"
          value={metrics?.active_temp_blocks ?? (loading ? "…" : 0)}
          hint="Current active temporary mitigations"
        />
        <MetricCard
          title="Reputation Entries"
          value={metrics?.reputation_entries ?? (loading ? "…" : 0)}
          hint="Tracked suspicious sources"
        />
        <MetricCard
          title="Total Events"
          value={metrics?.total_events ?? (loading ? "…" : 0)}
          hint="Persisted security events"
        />
        <MetricCard
          title="Blocked Events"
          value={metrics?.blocked_events ?? (loading ? "…" : 0)}
          hint="Rejected security actions"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionCard title="Recent Events">
          <SimpleTable
            columns={eventColumns}
            rows={events}
            emptyText="No recent events found"
          />
        </SectionCard>

        <SectionCard title="Active Mitigations">
          <SimpleTable
            columns={mitigationColumns}
            rows={mitigations}
            emptyText="No active mitigations"
          />
        </SectionCard>
      </div>

      <SectionCard title="Recent Audits">
        <SimpleTable
          columns={auditColumns}
          rows={audits}
          emptyText="No recent audits found"
        />
      </SectionCard>
    </div>
  );
}
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { analyticsApi, LinkDetailData } from "@/lib/api";
import Link from "next/link";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const PLATFORM_ICONS: Record<string, string> = {
  facebook: "📘",
  instagram: "📷",
  tiktok: "🎵",
  youtube: "📺",
  twitter: "🐦",
  shopee: "🛒",
  lazada: "🛍️",
  linkedin: "💼",
  github: "🐙",
  discord: "💬",
  twitch: "🎮",
  spotify: "🎧",
  telegram: "✈️",
  whatsapp: "💬",
  line: "💚",
  website: "🌐",
};

export default function LinkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = Number(params.id);

  const [data, setData] = useState<LinkDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [error, setError] = useState("");

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getLinkDetail(linkId, days);
      setData(res.data);
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load link detail");
    } finally {
      setLoading(false);
    }
  }, [linkId, days]);

  useEffect(() => {
    if (linkId) fetchDetail();
  }, [linkId, fetchDetail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-500">{error || "Link not found"}</p>
        <button
          onClick={() => router.push("/dashboard/links")}
          className="mt-4 text-indigo-600 hover:underline"
        >
          Back to Links
        </button>
      </div>
    );
  }

  const maxDailyClicks = Math.max(...data.clicksPerDay.map((d) => d.clicks), 1);
  const maxHourlyClicks = Math.max(...Object.values(data.clicksPerHour), 1);
  const maxDowClicks = Math.max(...Object.values(data.clicksPerDayOfWeek), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/links"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            ← Back
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {PLATFORM_ICONS[data.platform] || "🔗"}
              </span>
              <h1 className="text-2xl font-bold text-gray-900">{data.title}</h1>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${data.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
              >
                {data.active ? "Active" : "Hidden"}
              </span>
            </div>
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:underline"
            >
              {data.url}
            </a>
          </div>
        </div>

        {/* Time range */}
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${days === d ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Clicks" value={data.totalClicks} />
        <StatCard
          label="Devices"
          value={Object.keys(data.clicksPerDevice).length}
        />
        <StatCard
          label="Browsers"
          value={Object.keys(data.clicksPerBrowser).length}
        />
        <StatCard
          label="Created"
          value={new Date(data.createdAt).toLocaleDateString()}
          isText
        />
      </div>

      {/* Daily clicks chart */}
      {data.clicksPerDay.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Daily Clicks (Last {days} days)
          </h2>
          <div className="flex items-end gap-1" style={{ height: 200 }}>
            {data.clicksPerDay.map((d) => (
              <div
                key={d.date}
                className="group relative flex-1"
                style={{ height: "100%" }}
              >
                <div
                  className="absolute bottom-0 w-full rounded-t bg-indigo-500 transition-all group-hover:bg-indigo-600"
                  style={{
                    height: `${(d.clicks / maxDailyClicks) * 100}%`,
                    minHeight: d.clicks > 0 ? "4px" : "0",
                  }}
                />
                <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white whitespace-nowrap group-hover:block">
                  {d.date}: {d.clicks}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device & Browser distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Device */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Device Distribution
          </h2>
          {Object.keys(data.clicksPerDevice).length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.clicksPerDevice).map(([device, clicks]) => {
                const total = Object.values(data.clicksPerDevice).reduce(
                  (a, b) => a + b,
                  0,
                );
                const pct = total > 0 ? (clicks / total) * 100 : 0;
                return (
                  <div key={device}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {device === "MOBILE"
                          ? "📱 Mobile"
                          : device === "DESKTOP"
                            ? "💻 Desktop"
                            : device === "TABLET"
                              ? "📟 Tablet"
                              : device}
                      </span>
                      <span className="text-gray-500">
                        {clicks} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Browser */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Browser Distribution
          </h2>
          {Object.keys(data.clicksPerBrowser).length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.clicksPerBrowser).map(
                ([browser, clicks]) => {
                  const total = Object.values(data.clicksPerBrowser).reduce(
                    (a, b) => a + b,
                    0,
                  );
                  const pct = total > 0 ? (clicks / total) * 100 : 0;
                  return (
                    <div key={browser}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          {browser}
                        </span>
                        <span className="text-gray-500">
                          {clicks} ({pct.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-purple-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hourly & Day of Week distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Hourly */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Clicks by Hour
          </h2>
          {Object.keys(data.clicksPerHour).length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="flex items-end gap-0.5" style={{ height: 120 }}>
              {Array.from({ length: 24 }, (_, h) => {
                const clicks = data.clicksPerHour[h] || 0;
                return (
                  <div
                    key={h}
                    className="group relative flex-1"
                    style={{ height: "100%" }}
                  >
                    <div
                      className="absolute bottom-0 w-full rounded-t bg-amber-400 transition-all group-hover:bg-amber-500"
                      style={{
                        height: `${(clicks / maxHourlyClicks) * 100}%`,
                        minHeight: clicks > 0 ? "3px" : "0",
                      }}
                    />
                    <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs text-white whitespace-nowrap group-hover:block">
                      {h}:00 — {clicks} clicks
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>0h</span>
            <span>6h</span>
            <span>12h</span>
            <span>18h</span>
            <span>23h</span>
          </div>
        </div>

        {/* Day of week */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Clicks by Day of Week
          </h2>
          {Object.keys(data.clicksPerDayOfWeek).length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-2">
              {DAY_NAMES.map((name, i) => {
                const clicks = data.clicksPerDayOfWeek[i] || 0;
                const pct =
                  maxDowClicks > 0 ? (clicks / maxDowClicks) * 100 : 0;
                return (
                  <div key={name} className="flex items-center gap-3">
                    <span className="w-12 text-xs font-medium text-gray-600">
                      {name.slice(0, 3)}
                    </span>
                    <div className="h-5 flex-1 overflow-hidden rounded bg-gray-100">
                      <div
                        className="flex h-full items-center rounded bg-emerald-400 px-2 text-xs font-medium text-white"
                        style={{
                          width: `${Math.max(pct, clicks > 0 ? 8 : 0)}%`,
                        }}
                      >
                        {clicks > 0 && clicks}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Referrer table */}
      {Object.keys(data.clicksPerReferrer).length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Top Referrers
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="pb-2 font-medium">Source</th>
                  <th className="pb-2 text-right font-medium">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.clicksPerReferrer).map(([ref, clicks]) => (
                  <tr key={ref} className="border-b last:border-0">
                    <td className="py-2 text-gray-700">{ref}</td>
                    <td className="py-2 text-right font-medium">{clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent clicks table */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Recent Clicks
          <span className="ml-2 text-sm font-normal text-gray-400">
            (last 50)
          </span>
        </h2>
        {data.recentClicks.length === 0 ? (
          <p className="py-8 text-center text-gray-400">No clicks yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="pb-2 font-medium">Time</th>
                  <th className="pb-2 font-medium">Device</th>
                  <th className="pb-2 font-medium">Browser</th>
                  <th className="pb-2 font-medium">Referrer</th>
                  <th className="pb-2 font-medium">Country</th>
                </tr>
              </thead>
              <tbody>
                {data.recentClicks.map((click) => (
                  <tr
                    key={click.id}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-2 text-gray-700 whitespace-nowrap">
                      {new Date(click.clickedAt).toLocaleString()}
                    </td>
                    <td className="py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          click.deviceType === "MOBILE"
                            ? "bg-blue-100 text-blue-700"
                            : click.deviceType === "DESKTOP"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {click.deviceType === "MOBILE"
                          ? "📱"
                          : click.deviceType === "DESKTOP"
                            ? "💻"
                            : "📟"}{" "}
                        {click.deviceType || "Unknown"}
                      </span>
                    </td>
                    <td className="py-2 text-gray-600">
                      {click.browser || "Unknown"}
                    </td>
                    <td className="py-2 text-gray-600">
                      {click.referrer || "Direct"}
                    </td>
                    <td className="py-2 text-gray-600">
                      {click.country || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  isText = false,
}: {
  label: string;
  value: number | string;
  isText?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div
        className={`mt-1 font-bold ${isText ? "text-lg text-gray-900" : "text-2xl text-gray-900"}`}
      >
        {typeof value === "number" && !isText ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

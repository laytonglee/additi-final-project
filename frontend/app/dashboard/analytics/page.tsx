"use client";

import { useEffect, useState } from "react";
import { analyticsApi, AnalyticsData } from "@/lib/api";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await analyticsApi.get(days);
        setAnalytics(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [days]);

  useEffect(() => {
    (async () => {
      try {
        const res = await analyticsApi.getSuggestions();
        setSuggestions(res.data);
      } catch {
        // ignore
      } finally {
        setSuggestionsLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading analytics...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-gray-500">
        Could not load analytics data.
      </div>
    );
  }

  const maxDayClicks = Math.max(
    ...analytics.clicksPerDay.map((d) => d.clicks),
    1,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your link performance and visitor behavior
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={analyticsApi.exportCsvUrl(days)}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition inline-flex items-center gap-2"
          >
            📥 Export CSV
          </a>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Profile Views"
          value={analytics.totalViews}
          icon="👀"
        />
        <StatCard
          label="Total Clicks"
          value={analytics.totalClicks}
          icon="👆"
        />
        <StatCard label="Total Links" value={analytics.totalLinks} icon="🔗" />
        <StatCard
          label="Click Rate (CTR)"
          value={analytics.ctr}
          icon="🎯"
          suffix="%"
        />
        <StatCard
          label="Avg Clicks/Link"
          value={
            analytics.totalLinks > 0
              ? Math.round(analytics.totalClicks / analytics.totalLinks)
              : 0
          }
          icon="📊"
        />
      </div>

      {/* CTR Alert Banner */}
      {analytics.totalViews > 10 && analytics.ctr < 20 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-amber-800">
              Low Click-Through Rate
            </h3>
            <p className="text-sm text-amber-700 mt-1">
              Only {analytics.ctr}% of visitors click your links. Try adding
              descriptions to help visitors understand where each link goes, or
              feature your most important link to draw attention.
            </p>
          </div>
        </div>
      )}

      {/* AI Suggestions */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl border border-violet-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            🤖 AI-Powered Suggestions
            <span className="text-xs font-normal bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
              Powered by Gemini
            </span>
          </h2>
          <button
            onClick={async () => {
              setSuggestionsLoading(true);
              try {
                const res = await analyticsApi.getSuggestions();
                setSuggestions(res.data);
              } catch {
                /* ignore */
              } finally {
                setSuggestionsLoading(false);
              }
            }}
            disabled={suggestionsLoading}
            className="text-sm text-violet-600 hover:text-violet-800 font-medium disabled:opacity-50 flex items-center gap-1"
          >
            🔄 Refresh
          </button>
        </div>
        {suggestionsLoading ? (
          <p className="text-gray-500">🧠 AI is analyzing your data...</p>
        ) : suggestions ? (
          <div className="bg-white rounded-xl p-5 border border-violet-100 prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {suggestions}
          </div>
        ) : (
          <p className="text-gray-500">
            Not enough data yet for suggestions. Keep sharing your link!
          </p>
        )}
      </div>

      {/* Link Performance Health */}
      {analytics.linkPerformance && analytics.linkPerformance.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">
            🔥 Link Performance Health
          </h2>
          <div className="space-y-3">
            {analytics.linkPerformance
              .sort((a, b) => b.clicks - a.clicks)
              .map((link) => {
                const statusConfig = {
                  hot: {
                    label: "🔥 Hot",
                    bg: "bg-red-50 border-red-200",
                    text: "text-red-700",
                    bar: "bg-red-500",
                  },
                  warm: {
                    label: "🌤️ Warm",
                    bg: "bg-amber-50 border-amber-200",
                    text: "text-amber-700",
                    bar: "bg-amber-500",
                  },
                  cold: {
                    label: "❄️ Cold",
                    bg: "bg-blue-50 border-blue-200",
                    text: "text-blue-700",
                    bar: "bg-blue-500",
                  },
                  frozen: {
                    label: "🧊 No clicks",
                    bg: "bg-gray-50 border-gray-200",
                    text: "text-gray-500",
                    bar: "bg-gray-300",
                  },
                };
                const config = statusConfig[link.status];
                const maxClicks = Math.max(
                  ...analytics.linkPerformance.map((l) => l.clicks),
                  1,
                );
                return (
                  <div
                    key={link.linkId}
                    className={`rounded-lg border p-3 ${config.bg}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 text-sm">
                          {link.title}
                        </span>
                        {link.featured && (
                          <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full font-bold">
                            ⭐
                          </span>
                        )}
                        <span className={`text-xs font-medium ${config.text}`}>
                          {config.label}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {link.clicks} clicks
                      </span>
                    </div>
                    <div className="w-full bg-white/50 rounded-full h-1.5">
                      <div
                        className={`${config.bar} h-1.5 rounded-full transition-all`}
                        style={{ width: `${(link.clicks / maxClicks) * 100}%` }}
                      />
                    </div>
                    {link.status === "frozen" && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Tip: Add a description or make this a featured link
                        to attract clicks
                      </p>
                    )}
                    {link.status === "cold" && (
                      <p className="text-xs text-blue-600 mt-1">
                        💡 Consider moving this link higher or updating its
                        title
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Daily clicks chart */}
      {analytics.clicksPerDay.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Clicks Over Time</h2>
          <div className="flex items-end gap-1 h-40">
            {analytics.clicksPerDay.map((day, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end group"
              >
                <div className="relative w-full">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap transition">
                    {day.clicks} clicks
                  </div>
                  <div
                    className="w-full bg-violet-500 rounded-t hover:bg-violet-600 transition min-h-[2px]"
                    style={{
                      height: `${(day.clicks / maxDayClicks) * 100}%`,
                      minHeight: day.clicks > 0 ? "8px" : "2px",
                    }}
                  />
                </div>
                {analytics.clicksPerDay.length <= 14 && (
                  <p className="text-[10px] text-gray-400 mt-1 truncate w-full text-center">
                    {day.date.slice(5)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Clicks per link */}
        {Object.keys(analytics.clicksPerLink).length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Clicks Per Link</h2>
            <div className="space-y-3">
              {Object.entries(analytics.clicksPerLink)
                .sort(([, a], [, b]) => b - a)
                .map(([name, clicks]) => {
                  const maxClicks = Math.max(
                    ...Object.values(analytics.clicksPerLink),
                  );
                  return (
                    <div key={name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 truncate">
                          {name}
                        </span>
                        <span className="text-gray-500 ml-2">{clicks}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-violet-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${(clicks / maxClicks) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Device distribution */}
        {Object.keys(analytics.clicksPerDevice).length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Devices</h2>
            <div className="space-y-3">
              {Object.entries(analytics.clicksPerDevice)
                .sort(([, a], [, b]) => b - a)
                .map(([device, clicks]) => {
                  const percent = Math.round(
                    (clicks / analytics.totalClicks) * 100,
                  );
                  const icon =
                    device === "MOBILE"
                      ? "📱"
                      : device === "DESKTOP"
                        ? "💻"
                        : device === "TABLET"
                          ? "📱"
                          : "❓";
                  return (
                    <div
                      key={device}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span>{icon}</span>
                        <span className="text-sm font-medium text-gray-700">
                          {device}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {clicks} ({percent}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Browser distribution */}
        {Object.keys(analytics.clicksPerBrowser).length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">Browsers</h2>
            <div className="space-y-3">
              {Object.entries(analytics.clicksPerBrowser)
                .sort(([, a], [, b]) => b - a)
                .map(([browser, clicks]) => {
                  const percent = Math.round(
                    (clicks / analytics.totalClicks) * 100,
                  );
                  return (
                    <div
                      key={browser}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {browser}
                      </span>
                      <span className="text-sm text-gray-500">
                        {clicks} ({percent}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Day of week distribution */}
        {Object.keys(analytics.clicksPerDayOfWeek).length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-gray-900 mb-4">
              Clicks By Day of Week
            </h2>
            <div className="space-y-2">
              {Object.entries(analytics.clicksPerDayOfWeek).map(
                ([day, clicks]) => {
                  const maxDow = Math.max(
                    ...Object.values(analytics.clicksPerDayOfWeek),
                  );
                  const dayNum = Number(day);
                  return (
                    <div key={day}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">
                          {DAY_NAMES[dayNum] || `Day ${day}`}
                        </span>
                        <span className="text-gray-500">{clicks}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full"
                          style={{
                            width: `${(clicks / maxDow) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        )}
      </div>

      {/* Referrers */}
      {Object.keys(analytics.clicksPerReferrer).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Top Traffic Sources</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-500">
                    Source
                  </th>
                  <th className="text-right py-2 font-medium text-gray-500">
                    Clicks
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.clicksPerReferrer).map(
                  ([referrer, clicks]) => (
                    <tr key={referrer} className="border-b border-gray-50">
                      <td className="py-2 text-gray-700 truncate max-w-xs">
                        {referrer}
                      </td>
                      <td className="py-2 text-right text-gray-600">
                        {clicks}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {analytics.totalClicks === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No clicks yet
          </h3>
          <p className="text-gray-500">
            Share your profile link to start collecting analytics data!
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  suffix,
}: {
  label: string;
  value: number;
  icon: string;
  suffix?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {value}
        {suffix}
      </p>
    </div>
  );
}

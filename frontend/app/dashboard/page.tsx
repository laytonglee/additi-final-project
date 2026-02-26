"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { linkApi, LinkData, analyticsApi, AnalyticsData } from "@/lib/api";

export default function DashboardPage() {
  const { user } = useAuth();
  const [links, setLinks] = useState<LinkData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [linksRes, analyticsRes] = await Promise.all([
          linkApi.getAll(),
          analyticsApi.get(7),
        ]);
        setLinks(linksRes.data);
        setAnalytics(analyticsRes.data);
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  const totalClicks = analytics?.totalClicks || 0;
  const profileUrl = `${window.location.origin}/u/${user?.username}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.username}!</p>
      </div>

      {/* Profile link card */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
        <p className="text-violet-200 text-sm font-medium mb-1">
          Your Profile Link
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <code className="text-lg font-mono bg-white/20 px-3 py-1 rounded-lg">
            {profileUrl}
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(profileUrl)}
            className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition"
          >
            📋 Copy
          </button>
        </div>
        <p className="text-violet-200 text-sm mt-3">
          Paste this link in your TikTok bio, Instagram bio, WhatsApp status,
          and everywhere else!
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Links" value={links.length} icon="🔗" />
        <StatCard label="Total Clicks" value={totalClicks} icon="👆" />
        <StatCard
          label="Active Links"
          value={links.filter((l) => l.active).length}
          icon="✅"
        />
        <StatCard
          label="This Week"
          value={
            analytics?.clicksPerDay?.reduce((a, b) => a + b.clicks, 0) || 0
          }
          icon="📅"
        />
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/links"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-violet-300 hover:shadow-sm transition group"
        >
          <div className="text-2xl mb-2">🔗</div>
          <h3 className="font-bold text-gray-900 group-hover:text-violet-700 transition">
            Manage Links
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Add, edit, or reorder your links
          </p>
        </Link>
        <Link
          href="/dashboard/analytics"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-violet-300 hover:shadow-sm transition group"
        >
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-bold text-gray-900 group-hover:text-violet-700 transition">
            View Analytics
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            See click trends and AI insights
          </p>
        </Link>
      </div>

      {/* Top links */}
      {links.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Your Links</h2>
          <div className="space-y-3">
            {links.slice(0, 5).map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg">
                    {getPlatformIcon(link.platform)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {link.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{link.url}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600 ml-4 shrink-0">
                  {link.totalClicks} clicks
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {links.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No links yet!
          </h3>
          <p className="text-gray-500 mb-6">
            Add your first link to get started
          </p>
          <Link
            href="/dashboard/links"
            className="inline-flex px-6 py-2.5 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition"
          >
            Add Your First Link
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
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
  return icons[platform] || "🔗";
}

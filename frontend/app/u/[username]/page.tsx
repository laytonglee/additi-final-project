"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { publicApi, PublicProfile } from "@/lib/api";

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "bg-blue-600 hover:bg-blue-700",
  instagram:
    "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
  tiktok: "bg-gray-900 hover:bg-black",
  youtube: "bg-red-600 hover:bg-red-700",
  twitter: "bg-sky-500 hover:bg-sky-600",
  shopee: "bg-orange-500 hover:bg-orange-600",
  lazada: "bg-blue-500 hover:bg-blue-600",
  linkedin: "bg-blue-700 hover:bg-blue-800",
  github: "bg-gray-800 hover:bg-gray-900",
  discord: "bg-indigo-600 hover:bg-indigo-700",
  twitch: "bg-purple-600 hover:bg-purple-700",
  spotify: "bg-green-600 hover:bg-green-700",
  telegram: "bg-sky-600 hover:bg-sky-700",
  whatsapp: "bg-green-500 hover:bg-green-600",
  line: "bg-green-500 hover:bg-green-600",
  website: "bg-violet-600 hover:bg-violet-700",
};

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

// Theme mappings
const THEME_COLOR_MAP: Record<
  string,
  { btn: string; text: string; avatar: string; avatarText: string }
> = {
  violet: {
    btn: "bg-violet-600 hover:bg-violet-700",
    text: "text-violet-600",
    avatar: "bg-violet-600",
    avatarText: "text-white",
  },
  blue: {
    btn: "bg-blue-600 hover:bg-blue-700",
    text: "text-blue-600",
    avatar: "bg-blue-600",
    avatarText: "text-white",
  },
  green: {
    btn: "bg-green-600 hover:bg-green-700",
    text: "text-green-600",
    avatar: "bg-green-600",
    avatarText: "text-white",
  },
  rose: {
    btn: "bg-rose-600 hover:bg-rose-700",
    text: "text-rose-600",
    avatar: "bg-rose-600",
    avatarText: "text-white",
  },
  amber: {
    btn: "bg-amber-500 hover:bg-amber-600",
    text: "text-amber-600",
    avatar: "bg-amber-500",
    avatarText: "text-white",
  },
  slate: {
    btn: "bg-slate-700 hover:bg-slate-800",
    text: "text-slate-600",
    avatar: "bg-slate-700",
    avatarText: "text-white",
  },
};

const BG_MAP: Record<string, string> = {
  "gradient-violet":
    "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  "gradient-blue": "bg-gradient-to-br from-blue-100 via-cyan-50 to-sky-100",
  "gradient-green":
    "bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100",
  "gradient-rose": "bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-100",
  "solid-dark": "bg-gray-900",
  "solid-light": "bg-gray-100",
};

function getButtonClass(buttonStyle: string | null, themeBtn: string): string {
  const base =
    "block w-full py-4 px-6 font-semibold text-center shadow-md transition transform hover:scale-[1.02] hover:shadow-lg";
  const radius =
    buttonStyle === "pill"
      ? "rounded-full"
      : buttonStyle === "sharp"
        ? "rounded-none"
        : "rounded-xl";

  if (buttonStyle === "outline") {
    // for outline, swap to bordered style
    const borderColor = themeBtn.includes("violet")
      ? "border-violet-600 text-violet-700 hover:bg-violet-50"
      : themeBtn.includes("blue")
        ? "border-blue-600 text-blue-700 hover:bg-blue-50"
        : themeBtn.includes("green")
          ? "border-green-600 text-green-700 hover:bg-green-50"
          : themeBtn.includes("rose")
            ? "border-rose-600 text-rose-700 hover:bg-rose-50"
            : themeBtn.includes("amber")
              ? "border-amber-500 text-amber-700 hover:bg-amber-50"
              : "border-slate-700 text-slate-700 hover:bg-slate-50";
    return `${base} rounded-xl border-2 bg-white/80 ${borderColor}`;
  }
  return `${base} ${radius} text-white ${themeBtn}`;
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await publicApi.getProfile(username);
        setProfile(res.data);
        // Track this profile view
        publicApi.trackView(username);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            User Not Found
          </h1>
          <p className="text-gray-500">
            The profile &quot;{username}&quot; doesn&apos;t exist.
          </p>
          <a
            href="/"
            className="inline-block mt-6 px-6 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  // Resolve theme
  const themeColor =
    THEME_COLOR_MAP[profile.themeColor || "violet"] || THEME_COLOR_MAP.violet;
  const bgClass =
    BG_MAP[profile.backgroundColor || "gradient-violet"] ||
    BG_MAP["gradient-violet"];
  const isDark = profile.backgroundColor === "solid-dark";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const subtextColor = isDark ? "text-gray-300" : "text-gray-600";

  return (
    <div
      className={`min-h-screen ${bgClass} flex flex-col items-center px-4 py-12`}
    >
      {/* Profile card */}
      <div className="w-full max-w-md">
        {/* Avatar & info */}
        <div className="text-center mb-8">
          {profile.photo ? (
            <img
              src={profile.photo}
              alt={profile.username}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div
              className={`w-24 h-24 rounded-full mx-auto mb-4 ${themeColor.avatar} ${themeColor.avatarText} flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg`}
            >
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className={`text-2xl font-bold ${textColor}`}>
            @{profile.username}
          </h1>
          {profile.bio && (
            <p className={`${subtextColor} mt-2 max-w-sm mx-auto`}>
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links — featured first */}
        <div className="space-y-3">
          {[...profile.links]
            .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
            .map((link) => {
              // Use platform-specific colors if available, otherwise use theme color
              const usePlatformColor =
                PLATFORM_COLORS[link.platform] &&
                profile.buttonStyle !== "outline";
              const colorClass = usePlatformColor
                ? PLATFORM_COLORS[link.platform]
                : themeColor.btn;
              const icon = PLATFORM_ICONS[link.platform] || "🔗";

              if (usePlatformColor) {
                const radius =
                  profile.buttonStyle === "pill"
                    ? "rounded-full"
                    : profile.buttonStyle === "sharp"
                      ? "rounded-none"
                      : "rounded-xl";
                return (
                  <a
                    key={link.id}
                    href={publicApi.getClickUrl(link.id)}
                    className={`relative block w-full py-4 px-6 text-white font-semibold text-center shadow-md transition transform hover:scale-[1.02] hover:shadow-lg ${radius} ${colorClass} ${link.featured ? "ring-2 ring-amber-400 ring-offset-2" : ""}`}
                  >
                    {link.featured && (
                      <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        ⭐ TOP
                      </span>
                    )}
                    <span className="mr-2">{icon}</span>
                    {link.title}
                    {link.description && (
                      <span className="block text-xs font-normal opacity-80 mt-1">
                        {link.description}
                      </span>
                    )}
                  </a>
                );
              }

              return (
                <a
                  key={link.id}
                  href={publicApi.getClickUrl(link.id)}
                  className={`relative ${getButtonClass(profile.buttonStyle, themeColor.btn)} ${link.featured ? "ring-2 ring-amber-400 ring-offset-2" : ""}`}
                >
                  {link.featured && (
                    <span className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      ⭐ TOP
                    </span>
                  )}
                  <span className="mr-2">{icon}</span>
                  {link.title}
                  {link.description && (
                    <span className="block text-xs font-normal opacity-70 mt-1">
                      {link.description}
                    </span>
                  )}
                </a>
              );
            })}
        </div>

        {profile.links.length === 0 && (
          <div className={`text-center py-8 ${subtextColor}`}>
            <p>No links added yet.</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <a
            href="/"
            className={`text-sm ${isDark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-violet-600"} transition`}
          >
            🔗 Powered by LinkHub
          </a>
        </div>
      </div>
    </div>
  );
}

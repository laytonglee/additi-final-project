"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authApi, aiApi } from "@/lib/api";

const THEME_COLORS = [
  { value: "violet", label: "Violet", class: "bg-violet-500" },
  { value: "blue", label: "Blue", class: "bg-blue-500" },
  { value: "green", label: "Green", class: "bg-green-500" },
  { value: "rose", label: "Rose", class: "bg-rose-500" },
  { value: "amber", label: "Amber", class: "bg-amber-500" },
  { value: "slate", label: "Slate", class: "bg-slate-600" },
];

const BACKGROUNDS = [
  {
    value: "gradient-violet",
    label: "Violet Gradient",
    class: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  },
  {
    value: "gradient-blue",
    label: "Blue Gradient",
    class: "bg-gradient-to-br from-blue-100 via-cyan-50 to-sky-100",
  },
  {
    value: "gradient-green",
    label: "Green Gradient",
    class: "bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100",
  },
  {
    value: "gradient-rose",
    label: "Rose Gradient",
    class: "bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-100",
  },
  {
    value: "solid-dark",
    label: "Dark",
    class: "bg-gray-900",
  },
  {
    value: "solid-light",
    label: "Light",
    class: "bg-gray-100",
  },
];

const BUTTON_STYLES = [
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
  { value: "sharp", label: "Sharp" },
  { value: "outline", label: "Outline" },
];

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    photo: user?.photo || "",
  });
  const [theme, setTheme] = useState({
    themeColor: user?.themeColor || "violet",
    backgroundColor: user?.backgroundColor || "gradient-violet",
    buttonStyle: user?.buttonStyle || "rounded",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [generatingBio, setGeneratingBio] = useState(false);
  const [platforms, setPlatforms] = useState<string | null>(null);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await authApi.updateProfile({
        username: form.username,
        bio: form.bio || undefined,
        phoneNumber: form.phoneNumber || undefined,
        address: form.address || undefined,
        photo: form.photo || undefined,
        themeColor: theme.themeColor,
        backgroundColor: theme.backgroundColor,
        buttonStyle: theme.buttonStyle,
      });
      await refreshUser();
      setSuccess("Profile updated successfully!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Update your profile and theme</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Profile Information
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Public profile URL: /u/{form.username}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <button
                type="button"
                onClick={async () => {
                  setGeneratingBio(true);
                  try {
                    const res = await aiApi.generateBio();
                    setForm({ ...form, bio: res.data });
                  } catch {
                    setError("Failed to generate bio");
                  } finally {
                    setGeneratingBio(false);
                  }
                }}
                disabled={generatingBio}
                className="text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-medium hover:bg-violet-200 transition disabled:opacity-50 flex items-center gap-1"
              >
                {generatingBio ? "✨ Generating..." : "✨ Generate with AI"}
              </button>
            </div>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none resize-none"
              placeholder="Tell visitors about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo URL
            </label>
            <input
              type="url"
              value={form.photo}
              onChange={(e) => setForm({ ...form, photo: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="+1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="Your location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Email cannot be changed
            </p>
          </div>
        </div>

        {/* Theme Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">
            🎨 Theme Customization
          </h2>
          <p className="text-sm text-gray-500">
            Customize how your public profile looks to visitors
          </p>

          {/* Theme Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            <div className="flex flex-wrap gap-3">
              {THEME_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setTheme({ ...theme, themeColor: c.value })}
                  className={`w-10 h-10 rounded-full ${c.class} transition ring-offset-2 ${
                    theme.themeColor === c.value
                      ? "ring-2 ring-gray-900 scale-110"
                      : "hover:scale-105"
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background
            </label>
            <div className="grid grid-cols-3 gap-3">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.value}
                  type="button"
                  onClick={() =>
                    setTheme({ ...theme, backgroundColor: bg.value })
                  }
                  className={`h-16 rounded-lg ${bg.class} border-2 transition text-xs font-medium flex items-end justify-center pb-1 ${
                    theme.backgroundColor === bg.value
                      ? "border-gray-900 ring-1 ring-gray-900"
                      : "border-gray-200 hover:border-gray-400"
                  } ${bg.value === "solid-dark" ? "text-white" : "text-gray-700"}`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Button Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Button Style
            </label>
            <div className="flex flex-wrap gap-3">
              {BUTTON_STYLES.map((s) => {
                const borderRadius =
                  s.value === "pill"
                    ? "rounded-full"
                    : s.value === "sharp"
                      ? "rounded-none"
                      : "rounded-xl";
                const isOutline = s.value === "outline";
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setTheme({ ...theme, buttonStyle: s.value })}
                    className={`px-5 py-2.5 text-sm font-medium transition ${borderRadius} ${
                      isOutline
                        ? "border-2 border-violet-500 text-violet-600 bg-white"
                        : "bg-violet-500 text-white"
                    } ${
                      theme.buttonStyle === s.value
                        ? "ring-2 ring-gray-900 ring-offset-2"
                        : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-50 transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* AI Platform Recommendations */}
      <div className="max-w-2xl">
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl border border-violet-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              🤖 AI Platform Recommendations
              <span className="text-xs font-normal bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                Powered by Gemini
              </span>
            </h2>
            <button
              type="button"
              onClick={async () => {
                setLoadingPlatforms(true);
                try {
                  const res = await aiApi.recommendPlatforms();
                  setPlatforms(res.data);
                } catch {
                  setError("Failed to get recommendations");
                } finally {
                  setLoadingPlatforms(false);
                }
              }}
              disabled={loadingPlatforms}
              className="text-sm bg-violet-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-violet-700 transition disabled:opacity-50"
            >
              {loadingPlatforms
                ? "Analyzing..."
                : platforms
                  ? "🔄 Refresh"
                  : "✨ Get Suggestions"}
            </button>
          </div>
          {platforms ? (
            <div className="bg-white rounded-lg p-5 border border-violet-100 prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
              {platforms}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Click &quot;Get Suggestions&quot; to let Gemini AI analyze your
              links and recommend platforms to add.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

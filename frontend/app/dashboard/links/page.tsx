"use client";

import { useEffect, useState, useCallback } from "react";
import { linkApi, LinkData, aiApi } from "@/lib/api";
import Link from "next/link";

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

export default function LinksPage() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    url: "",
    platform: "",
    description: "",
    featured: false,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiTitleLinkId, setAiTitleLinkId] = useState<number | null>(null);
  const [aiTitles, setAiTitles] = useState<string | null>(null);
  const [aiTitleLoading, setAiTitleLoading] = useState(false);

  const fetchLinks = useCallback(async () => {
    try {
      const res = await linkApi.getAll();
      setLinks(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const resetForm = () => {
    setForm({
      title: "",
      url: "",
      platform: "",
      description: "",
      featured: false,
    });
    setShowAdd(false);
    setEditingId(null);
    setError("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await linkApi.create({
        title: form.title,
        url: form.url,
        platform: form.platform || undefined,
        description: form.description || undefined,
        featured: form.featured || undefined,
      });
      resetForm();
      await fetchLinks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create link");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setError("");
    setSaving(true);

    try {
      await linkApi.update(editingId, {
        title: form.title,
        url: form.url,
        platform: form.platform || undefined,
        description: form.description || undefined,
        featured: form.featured,
      });
      resetForm();
      await fetchLinks();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update link");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return;
    try {
      await linkApi.delete(id);
      await fetchLinks();
    } catch {
      // ignore
    }
  };

  const handleToggle = async (link: LinkData) => {
    try {
      await linkApi.update(link.id, { active: !link.active });
      await fetchLinks();
    } catch {
      // ignore
    }
  };

  const startEdit = (link: LinkData) => {
    setEditingId(link.id);
    setForm({
      title: link.title,
      url: link.url,
      platform: link.platform,
      description: link.description || "",
      featured: link.featured,
    });
    setShowAdd(false);
  };

  const moveLink = async (index: number, direction: "up" | "down") => {
    const newLinks = [...links];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newLinks.length) return;

    [newLinks[index], newLinks[swapIndex]] = [
      newLinks[swapIndex],
      newLinks[index],
    ];

    setLinks(newLinks);

    try {
      await linkApi.reorder(newLinks.map((l) => l.id));
      await fetchLinks();
    } catch {
      await fetchLinks(); // revert
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">Loading links...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Links</h1>
          <p className="text-gray-600 mt-1">Manage your link-in-bio page</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAdd(true);
          }}
          className="px-5 py-2.5 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition"
        >
          + Add Link
        </button>
      </div>

      {/* Add/Edit form */}
      {(showAdd || editingId) && (
        <form
          onSubmit={editingId ? handleUpdate : handleAdd}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          <h2 className="font-bold text-gray-900">
            {editingId ? "Edit Link" : "Add New Link"}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                placeholder="e.g. My Instagram"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                required
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                placeholder="https://instagram.com/yourhandle"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform (auto-detected if left empty)
            </label>
            <select
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
            >
              <option value="">Auto-detect from URL</option>
              {Object.entries(PLATFORM_ICONS).map(([key, icon]) => (
                <option key={key} value={key}>
                  {icon} {key.charAt(0).toUpperCase() + key.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (shown on public page)
            </label>
            <input
              type="text"
              maxLength={200}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="Brief description to encourage clicks"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500"
            />
            <span className="text-sm font-medium text-gray-700">
              ⭐ Featured link
            </span>
            <span className="text-xs text-gray-400">
              (highlighted on your page)
            </span>
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-50 transition"
            >
              {saving ? "Saving..." : editingId ? "Update Link" : "Add Link"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Links list */}
      {links.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No links yet</h3>
          <p className="text-gray-500">
            Click &quot;Add Link&quot; above to add your first link!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link, index) => (
            <div
              key={link.id}
              className={`bg-white rounded-xl border p-4 transition ${
                link.active ? "border-gray-200" : "border-gray-100 opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveLink(index, "up")}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveLink(index, "down")}
                    disabled={index === links.length - 1}
                    className="text-gray-400 hover:text-gray-700 disabled:opacity-30 text-xs"
                  >
                    ▼
                  </button>
                </div>

                {/* Icon */}
                <span className="text-2xl">
                  {PLATFORM_ICONS[link.platform] || "🔗"}
                </span>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {link.title}
                    </h3>
                    {link.featured && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium">
                        ⭐ Featured
                      </span>
                    )}
                    {!link.active && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{link.url}</p>
                  {link.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {link.description}
                    </p>
                  )}
                </div>

                {/* Clicks */}
                <div className="text-center px-3">
                  <p className="text-lg font-bold text-gray-900">
                    {link.totalClicks}
                  </p>
                  <p className="text-xs text-gray-500">clicks</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(link)}
                    className={`w-10 h-6 rounded-full transition relative ${
                      link.active ? "bg-violet-600" : "bg-gray-300"
                    }`}
                    title={link.active ? "Disable" : "Enable"}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        link.active ? "left-4.5" : "left-0.5"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => startEdit(link)}
                    className="p-2 text-gray-400 hover:text-violet-600 transition"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={async () => {
                      setAiTitleLinkId(link.id);
                      setAiTitles(null);
                      setAiTitleLoading(true);
                      try {
                        const res = await aiApi.optimizeTitle(link.id);
                        setAiTitles(res.data);
                      } catch {
                        setAiTitles("Failed to generate suggestions");
                      } finally {
                        setAiTitleLoading(false);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-amber-600 transition"
                    title="AI Title Suggestions"
                  >
                    ✨
                  </button>
                  <Link
                    href={`/dashboard/links/${link.id}`}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition"
                    title="View Analytics"
                  >
                    📊
                  </Link>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              {/* AI Title Suggestions Panel */}
              {aiTitleLinkId === link.id && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-violet-700 flex items-center gap-1">
                      ✨ AI Title Suggestions
                      <span className="text-[10px] font-normal bg-violet-100 px-1.5 py-0.5 rounded-full">
                        Gemini
                      </span>
                    </span>
                    <button
                      onClick={() => setAiTitleLinkId(null)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      ✕ Close
                    </button>
                  </div>
                  {aiTitleLoading ? (
                    <p className="text-xs text-gray-500">
                      🧠 Gemini is thinking...
                    </p>
                  ) : aiTitles ? (
                    <div className="bg-violet-50 rounded-lg p-3 text-xs text-gray-700 whitespace-pre-wrap border border-violet-100">
                      {aiTitles}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

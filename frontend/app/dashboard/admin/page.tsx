"use client";

import { useEffect, useState } from "react";
import { adminApi, AdminDashboard } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    if (user && !user.roles.includes("ADMIN")) {
      router.replace("/dashboard");
      return;
    }
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    try {
      const res = await adminApi.getDashboard();
      setDashboard(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (userId: number, enabled: boolean) => {
    setToggling(userId);
    try {
      await adminApi.toggleUser(userId, !enabled);
      setDashboard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.map((u) =>
            u.id === userId ? { ...u, enabled: !enabled } : u,
          ),
        };
      });
    } catch {
      alert("Failed to toggle user status");
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Loading admin dashboard...
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12 text-gray-500">
        Could not load admin dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage users and view platform-wide statistics
        </p>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Users" value={dashboard.totalUsers} icon="👥" />
        <StatCard label="Total Links" value={dashboard.totalLinks} icon="🔗" />
        <StatCard
          label="Total Clicks"
          value={dashboard.totalClicks}
          icon="👆"
        />
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            All Users ({dashboard.users.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Roles</th>
                <th className="px-6 py-3 text-center">Links</th>
                <th className="px-6 py-3 text-center">Clicks</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dashboard.users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {u.photo ? (
                        <img
                          src={u.photo}
                          alt={u.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-gray-900">
                        {u.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {u.roles.map((role) => (
                        <span
                          key={role}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            role === "ADMIN"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-700">
                    {u.linkCount}
                  </td>
                  <td className="px-6 py-4 text-center text-gray-700">
                    {u.clickCount}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.enabled
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.enabled ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {!u.roles.includes("ADMIN") && (
                      <button
                        onClick={() => handleToggle(u.id, u.enabled)}
                        disabled={toggling === u.id}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          u.enabled
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        } disabled:opacity-50`}
                      >
                        {toggling === u.id
                          ? "..."
                          : u.enabled
                            ? "Disable"
                            : "Enable"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900">
          {value.toLocaleString()}
        </div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}

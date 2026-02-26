"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { APP_URL } from "@/lib/api";

const baseNavItems = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/dashboard/links", label: "My Links", icon: "🔗" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📈" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = user.roles.includes("ADMIN")
    ? [
        ...baseNavItems,
        { href: "/dashboard/admin", label: "Admin", icon: "🛡️" },
      ]
    : baseNavItems;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/dashboard" className="text-xl font-bold text-violet-700">
            🔗 LinkHub
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href={`/u/${user.username}`}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-gray-600 hover:text-violet-600 transition"
            >
              <span>🌐</span>
              <span>
                {APP_URL.replace(/^https?:\/\//, "")}/u/{user.username}
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-gray-700">
                {user.username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* Sidebar - desktop */}
        <aside className="hidden md:block w-56 shrink-0">
          <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition ${
                  pathname === item.href
                    ? "bg-violet-50 text-violet-700 border-l-3 border-violet-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
          <div className="flex justify-around py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-xs ${
                  pathname === item.href ? "text-violet-700" : "text-gray-500"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-violet-700">
          🔗 LinkHub
        </Link>
        <div className="flex items-center gap-4">
          {loading ? null : user ? (
            <Link
              href="/dashboard"
              className="px-5 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2 rounded-lg border border-violet-300 text-violet-700 font-medium hover:bg-violet-50 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            All Your Links.
            <br />
            <span className="text-violet-600">One Simple Page.</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Create a beautiful link page for your social media, shops, and
            websites. Share one link everywhere and track every click with
            AI-powered analytics.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 rounded-xl bg-violet-600 text-white text-lg font-semibold hover:bg-violet-700 transition shadow-lg shadow-violet-200"
            >
              Create Your LinkHub — Free
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              One Link For Everything
            </h3>
            <p className="text-gray-600">
              Add all your social media, shops, and websites. Share a single
              link in your bio that leads to everything.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Real-Time Analytics
            </h3>
            <p className="text-gray-600">
              See who clicks your links, when they click, what device
              they&apos;re using, and where they come from.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              AI-Powered Insights
            </h3>
            <p className="text-gray-600">
              Get smart suggestions on when to post, which links perform best,
              and how to grow your audience.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Sign Up", desc: "Create your free account" },
              {
                step: "2",
                title: "Add Links",
                desc: "Add all your social media & shop links",
              },
              {
                step: "3",
                title: "Share",
                desc: "Get your unique link & put it everywhere",
              },
              {
                step: "4",
                title: "Track",
                desc: "Watch clicks & get AI suggestions",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-700 font-bold text-xl flex items-center justify-center mb-3">
                  {item.step}
                </div>
                <h4 className="font-bold text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
          <span>&copy; 2026 LinkHub. All rights reserved.</span>
          <span>Built for ADDITI Academy Final Project</span>
        </div>
      </footer>
    </div>
  );
}

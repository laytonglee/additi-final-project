"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
  ShieldCheck,
  Zap,
  FolderSearch,
  Users2,
  BarChart3,
  PlusCircle,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { messageApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/projects", label: "Projects", icon: FolderSearch },
  { href: "/explore", label: "Explore", icon: Sparkles },
  { href: "/community", label: "Community", icon: Users2 },
  { href: "/insights", label: "Insights", icon: BarChart3 },
];

export function Navbar() {
  const { user, loading, logout, isClient, isFreelancer, isAdmin } =
    useAuthStore();

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;

    messageApi
      .unreadCount()
      .then((res) => {
        setUnreadMessages(Number(res.data.data));
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50">
      <nav className="border-b border-border/50 bg-background/75 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4 relative">
            {/* Brand */}
            <div className="flex items-center min-w-0 mt-2">
              <Link href="/" className="group flex items-center shrink-0">
                <Image
                  src="/khmerlance-logo-2.png"
                  alt="Khmerlance"
                  width={180}
                  height={52}
                  className="w-full object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Desktop Nav — centered absolutely */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1  p-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                      active
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="desktop-nav-pill"
                        className="absolute inset-0 rounded-xl bg-background shadow-sm border border-border/60"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <link.icon className="relative z-10 size-4" />
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Desktop quick actions */}
              {user && (
                <div className="hidden md:flex items-center gap-2">
                  {isClient() && (
                    <Button
                      asChild
                      size="sm"
                      className="rounded-xl h-10 px-4 shadow-sm"
                    >
                      <Link href="/post-project">
                        <PlusCircle className="mr-2 size-4" />
                        Post Project
                      </Link>
                    </Button>
                  )}

                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="relative rounded-xl"
                  >
                    <Link href="/messages" aria-label="Messages">
                      <MessageCircle className="size-4" />
                      {unreadMessages > 0 && (
                        <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 rounded-full bg-destructive" />
                      )}
                    </Link>
                  </Button>
                </div>
              )}

              {user ? (
                <>
                  {/* User Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-10 rounded-xl px-2 sm:px-3 hover:bg-muted/70"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="size-8 ring-1 ring-border">
                            {user.avatarUrl && (
                              <AvatarImage
                                src={user.avatarUrl}
                                alt={user.name}
                              />
                            )}
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="hidden sm:flex flex-col items-start leading-none max-w-[140px]">
                            <span className="text-sm font-semibold truncate">
                              {user.name}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {isClient()
                                ? "Client"
                                : isFreelancer()
                                  ? "Freelancer"
                                  : isAdmin()
                                    ? "Admin"
                                    : "User"}
                            </span>
                          </div>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-60 rounded-2xl p-2"
                    >
                      <div className="px-2 py-2">
                        <p className="text-sm font-semibold truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>

                      <DropdownMenuSeparator />

                      {isClient() && (
                        <DropdownMenuItem asChild className="rounded-xl">
                          <Link href="/client/dashboard">
                            <LayoutDashboard className="mr-2 size-4" />
                            Client Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}

                      {isFreelancer() && (
                        <DropdownMenuItem asChild className="rounded-xl">
                          <Link href="/freelancer/dashboard">
                            <LayoutDashboard className="mr-2 size-4" />
                            Freelancer Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}

                      {isAdmin() && (
                        <DropdownMenuItem asChild className="rounded-xl">
                          <Link href="/admin">
                            <ShieldCheck className="mr-2 size-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem asChild className="rounded-xl">
                        <Link href="/messages">
                          <MessageCircle className="mr-2 size-4" />
                          Messages
                          {unreadMessages > 0 && (
                            <Badge
                              variant="destructive"
                              className="ml-auto rounded-full px-1.5 text-[10px]"
                            >
                              {unreadMessages}
                            </Badge>
                          )}
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild className="rounded-xl">
                        <Link href="/settings">
                          <Settings className="mr-2 size-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="rounded-xl text-destructive focus:text-destructive"
                        onClick={() => logout()}
                      >
                        <LogOut className="mr-2 size-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Mobile Menu Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden rounded-xl"
                    onClick={() => setMobileOpen((v) => !v)}
                    aria-label="Toggle navigation menu"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {mobileOpen ? (
                        <motion.div
                          key="close"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <X className="size-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="menu"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <Menu className="size-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </>
              ) : (
                <>
                  <div
                    className={`hidden sm:flex items-center gap-2 transition-opacity ${
                      loading ? "opacity-0 pointer-events-none" : ""
                    }`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl"
                      asChild
                    >
                      <Link href="/login">Sign In</Link>
                    </Button>

                    <Button size="sm" className="rounded-xl px-4" asChild>
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden rounded-xl"
                    onClick={() => setMobileOpen((v) => !v)}
                    aria-label="Toggle navigation menu"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {mobileOpen ? (
                        <motion.div
                          key="close-mobile"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <X className="size-5" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="menu-mobile"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <Menu className="size-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-2xl"
            >
              <div className="px-4 py-4 space-y-3">
                <div className="space-y-1">
                  {navLinks.map((link, index) => {
                    const active = isActive(link.href);
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <Link
                          href={link.href}
                          className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                            active
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <link.icon className="size-4" />
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}

                  {user && isClient() && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: 0.18 }}
                    >
                      <Link
                        href="/post-project"
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                          isActive("/post-project")
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <PlusCircle className="size-4" />
                        Post Project
                      </Link>
                    </motion.div>
                  )}

                  {user && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ delay: 0.22 }}
                    >
                      <Link
                        href="/messages"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        <MessageCircle className="size-4" />
                        Messages
                        {unreadMessages > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto rounded-full px-1.5 text-[10px]"
                          >
                            {unreadMessages}
                          </Badge>
                        )}
                      </Link>
                    </motion.div>
                  )}
                </div>

                {!user && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button variant="outline" className="rounded-xl" asChild>
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button className="rounded-xl" asChild>
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

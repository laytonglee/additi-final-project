"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { NotificationBell } from "@/components/NotificationBell";
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { messageApi } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/projects", label: "Browse Projects", icon: FolderSearch },
  { href: "/explore", label: "Explore", icon: Zap },
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <motion.div
                className="size-7 rounded-lg bg-primary flex items-center justify-center shadow-sm"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Zap className="size-4 text-primary-foreground fill-current" />
              </motion.div>
              <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                FreelanceHub
              </span>
            </Link>

            {/* Center nav links — desktop */}
            <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-primary bg-primary/8"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <link.icon className="size-3.5 shrink-0" />
                  {link.label}
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-md bg-primary/10 -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              ))}
              {user && isClient() && (
                <Link
                  href="/post-project"
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive("/post-project")
                      ? "text-primary bg-primary/8"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <PlusCircle className="size-3.5 shrink-0" />
                  Post Project
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1 shrink-0">
              {loading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded-lg" />
              ) : user ? (
                <>
                  <NotificationBell />

                  {/* Messages icon */}
                  <Link href="/messages" className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative size-9 rounded-lg"
                    >
                      <MessageCircle className="size-4" />
                      <AnimatePresence>
                        {unreadMessages > 0 && (
                          <motion.span
                            key="badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5"
                          >
                            <Badge
                              variant="destructive"
                              className="size-4 p-0 flex items-center justify-center text-[9px] rounded-full"
                            >
                              {unreadMessages > 9 ? "9+" : unreadMessages}
                            </Badge>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </Link>

                  {/* Avatar dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 pl-2 pr-3 h-9 rounded-lg hover:bg-muted/60"
                      >
                        <Avatar className="size-6">
                          {user.avatarUrl && (
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                          )}
                          <AvatarFallback className="bg-primary/15 text-primary text-[10px] font-bold">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
                          {user.name}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <div className="px-2 py-1.5 border-b border-border/50 mb-1">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      {isClient() && (
                        <DropdownMenuItem asChild>
                          <Link href="/client/dashboard">
                            <LayoutDashboard className="mr-2 size-3.5" />
                            Client Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {isFreelancer() && (
                        <DropdownMenuItem asChild>
                          <Link href="/freelancer/dashboard">
                            <LayoutDashboard className="mr-2 size-3.5" />
                            Freelancer Dashboard
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {isAdmin() && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin">
                            <ShieldCheck className="mr-2 size-3.5" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href="/messages">
                          <MessageCircle className="mr-2 size-3.5" />
                          Messages
                          {unreadMessages > 0 && (
                            <Badge
                              variant="destructive"
                              className="ml-auto text-[10px] px-1.5 py-px"
                            >
                              {unreadMessages}
                            </Badge>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings">
                          <Settings className="mr-2 size-3.5" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => logout()}
                      >
                        <LogOut className="mr-2 size-3.5" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Mobile hamburger */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden size-9 rounded-lg"
                    onClick={() => setMobileOpen((v) => !v)}
                    aria-label="Toggle menu"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {mobileOpen ? (
                        <motion.span
                          key="close"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <X className="size-4" />
                        </motion.span>
                      ) : (
                        <motion.span
                          key="menu"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <Menu className="size-4" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-lg"
                    asChild
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" className="rounded-lg" asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                  {/* Mobile hamburger for logged-out */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden size-9 rounded-lg"
                    onClick={() => setMobileOpen((v) => !v)}
                    aria-label="Toggle menu"
                  >
                    {mobileOpen ? (
                      <X className="size-4" />
                    ) : (
                      <Menu className="size-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="md:hidden overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
            >
              <motion.div
                className="px-4 py-3 space-y-1"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
              >
                {navLinks.map((link) => (
                  <motion.div
                    key={link.href}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.2 },
                      },
                    }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? "text-primary bg-primary/8"
                          : "text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <link.icon className="size-4 text-muted-foreground" />
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {user && isClient() && (
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.2 },
                      },
                    }}
                  >
                    <Link
                      href="/post-project"
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive("/post-project")
                          ? "text-primary bg-primary/8"
                          : "text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <PlusCircle className="size-4 text-muted-foreground" />
                      Post Project
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

"use client";

import Link from "next/link";
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
} from "lucide-react";
import { useEffect, useState } from "react";
import { messageApi } from "@/lib/api";

export function Navbar() {
  const { user, loading, logout, isClient, isFreelancer, isAdmin } =
    useAuthStore();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (!user) return;
    messageApi
      .unreadCount()
      .then((res) => {
        setUnreadMessages(Number(res.data.data));
      })
      .catch(() => {});
  }, [user]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-primary">
            FreelanceHub
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">Browse Projects</Link>
            </Button>
            {user && isClient() && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/post-project">Post a Project</Link>
              </Button>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-5 w-20 bg-muted animate-pulse rounded" />
            ) : user ? (
              <>
                <NotificationBell />
                {/* Messages icon with unread badge */}
                <Link href="/messages" className="relative">
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageCircle className="size-5" />
                    {unreadMessages > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center text-[10px] rounded-full"
                      >
                        {unreadMessages > 9 ? "9+" : unreadMessages}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative flex items-center gap-2 px-2"
                    >
                      <Avatar className="size-7">
                        {user.avatarUrl && (
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline text-sm font-medium">
                        {user.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {isClient() && (
                      <DropdownMenuItem asChild>
                        <Link href="/client/dashboard">
                          <LayoutDashboard className="mr-2 size-4" />
                          Client Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {isFreelancer() && (
                      <DropdownMenuItem asChild>
                        <Link href="/freelancer/dashboard">
                          <LayoutDashboard className="mr-2 size-4" />
                          Freelancer Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {isAdmin() && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <ShieldCheck className="mr-2 size-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/messages">
                        <MessageCircle className="mr-2 size-4" />
                        Messages
                        {unreadMessages > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto text-xs px-1.5 py-0"
                          >
                            {unreadMessages}
                          </Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="mr-2 size-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => logout()}
                    >
                      <LogOut className="mr-2 size-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

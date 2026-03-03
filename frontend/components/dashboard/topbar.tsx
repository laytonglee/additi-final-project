"use client";

import { useAuthStore } from "@/store/auth";
import { NotificationBell } from "@/components/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export function Topbar() {
  const { user, logout } = useAuthStore();

  return (
    <div className="flex items-center gap-3">
      {/* Search */}
      <div className="relative hidden sm:block">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Search anything"
          className="pl-8 h-8 w-48 lg:w-64 bg-muted/50 border-0 text-sm focus-visible:ring-1"
        />
      </div>

      {/* Notification bell */}
      <NotificationBell />

      {/* User avatar dropdown */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="size-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/40 transition-all">
              {user.avatarUrl && (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* User info */}
            <DropdownMenuLabel className="flex items-center gap-3 py-2">
              <Avatar className="size-9">
                {user.avatarUrl && (
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                )}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm truncate">
                  {user.name}
                </span>
                <span className="text-xs text-muted-foreground truncate font-normal">
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/profile/${user.id}`} className="cursor-pointer">
                <User className="mr-2 size-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="mr-2 size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onClick={() => logout()}
            >
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

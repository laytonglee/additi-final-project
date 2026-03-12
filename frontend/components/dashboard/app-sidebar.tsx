"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  FolderSearch,
  Zap,
  PlusCircle,
  FileText,
  MessageCircle,
  Bell,
  Settings,
  ShieldCheck,
  Users2,
  BarChart3,
  LogOut,
  ChevronsUpDown,
  FolderOpen,
  Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { messageApi } from "@/lib/api";
import { useNotificationStore } from "@/store/notifications";

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout, isClient, isFreelancer, isAdmin } = useAuthStore();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const unreadNotifs = useNotificationStore((s) => s.unreadCount);
  const [mounted, setMounted] = useState(false);
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    messageApi
      .unreadCount()
      .then((r) => setUnreadMessages(Number(r.data.data)))
      .catch(() => {});
  }, [user]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  // Build nav items based on role
  const generalItems = [
    ...(isClient()
      ? [
          {
            href: "/client/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          {
            href: "/client/projects",
            label: "My Projects",
            icon: FolderSearch,
          },
        ]
      : []),
    ...(isFreelancer()
      ? [
          {
            href: "/freelancer/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          {
            href: "/freelancer/projects",
            label: "Browse Projects",
            icon: FolderSearch,
          },
        ]
      : []),
  ];

  const pageItems = isAdmin()
    ? []
    : [
        ...(isClient()
          ? [{ href: "/post-project", label: "Post Project", icon: PlusCircle }]
          : []),
        {
          href: "/contracts",
          label: "Contracts",
          icon: FileText,
          badge: undefined as number | undefined,
        },
        {
          href: "/messages",
          label: "Messages",
          icon: MessageCircle,
          badge: unreadMessages || undefined,
        },
        {
          href: "/notifications",
          label: "Notifications",
          icon: Bell,
          badge: unreadNotifs || undefined,
        },
      ];

  const otherItems = isAdmin()
    ? [{ href: "/settings", label: "Settings", icon: Settings }]
    : [
        { href: "/explore", label: "Explore", icon: Zap },
        { href: "/community", label: "Community", icon: Users2 },
        { href: "/insights", label: "Insights", icon: BarChart3 },
        { href: "/settings", label: "Settings", icon: Settings },
      ];

  if (!mounted) return null;

  return (
    <Sidebar collapsible="icon">
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Zap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">FreelanceHub</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    Dashboard
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {/* Admin — shown first and prominently for admin users */}
        {isAdmin() && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[
                  { href: "/admin", label: "Overview", icon: ShieldCheck },
                  { href: "/admin/users", label: "Users", icon: Users2 },
                  { href: "/admin/projects", label: "Projects", icon: FolderOpen },
                  { href: "/admin/categories", label: "Categories", icon: Tag },
                ].map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* General — hidden while inside admin routes */}
        {!isAdminRoute && generalItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {generalItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Pages — only shown for client/freelancer */}
        {pageItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Pages</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {pageItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge && item.badge > 0 && (
                      <SidebarMenuBadge>
                        {item.badge > 9 ? "9+" : item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Others */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {isAdmin() && !isClient() && !isFreelancer() ? "Account" : "Others"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — user */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    {user?.avatarUrl && (
                      <AvatarImage src={user.avatarUrl} alt={user?.name} />
                    )}
                    <AvatarFallback className="rounded-lg bg-primary/15 text-primary text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    {user?.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                    <AvatarFallback className="rounded-lg bg-primary/15 text-primary text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

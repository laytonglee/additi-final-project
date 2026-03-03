export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage: boolean;
}

const labelMap: Record<string, string> = {
  admin: "Admin Panel",
  client: "Client",
  freelancer: "Freelancer",
  dashboard: "Dashboard",
  settings: "Settings",
  notifications: "Notifications",
  messages: "Messages",
  contracts: "Contracts",
  "post-project": "Post Project",
  projects: "Projects",
  explore: "Explore",
  community: "Community",
  insights: "Insights",
  profile: "Profile",
};

function toLabel(segment: string): string {
  return (
    labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
  );
}

export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0)
    return [{ label: "Dashboard", href: "/", isCurrentPage: true }];

  const crumbs: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/", isCurrentPage: false },
  ];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    crumbs.push({
      label: toLabel(segment),
      href: currentPath,
      isCurrentPage: index === segments.length - 1,
    });
  });

  return crumbs;
}

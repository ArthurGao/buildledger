import {
  AlertTriangle,
  Building2,
  Inbox,
  LayoutDashboard,
  MessageSquareText,
  Plug,
  ReceiptText,
  Stamp,
} from "lucide-react";

/** Single source of truth for navigation, shared by the sidebar and mobile menu. */
export const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: Building2 },
  { href: "/invoices", label: "Invoices", icon: ReceiptText },
  { href: "/approvals", label: "Approvals", icon: Stamp, badge: "approvals" as const },
  { href: "/exceptions", label: "Exceptions", icon: AlertTriangle, badge: "exceptions" as const, tone: "over" as const },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/assistant", label: "Assistant", icon: MessageSquareText },
  { href: "/integrations", label: "Integrations", icon: Plug },
];

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

import {
  AlertTriangle,
  Building2,
  FileDiff,
  Inbox,
  Landmark,
  LayoutDashboard,
  MessageSquareText,
  Plug,
  ReceiptText,
  ShoppingCart,
  Stamp,
  Target,
  Wallet,
} from "lucide-react";

/** Single source of truth for navigation, shared by the sidebar and mobile menu. */
export const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: Target },
  { href: "/projects", label: "Projects", icon: Building2 },
  { href: "/variations", label: "Variations", icon: FileDiff, badge: "variationClocks" as const, tone: "over" as const },
  { href: "/purchases", label: "Purchases", icon: ShoppingCart },
  { href: "/invoices", label: "Invoices", icon: ReceiptText },
  { href: "/approvals", label: "Approvals", icon: Stamp, badge: "approvals" as const },
  { href: "/claims", label: "Progress claims", icon: Wallet },
  { href: "/retentions", label: "Retentions", icon: Landmark, badge: "retentionAlert" as const, tone: "over" as const },
  { href: "/exceptions", label: "Exceptions", icon: AlertTriangle, badge: "exceptions" as const, tone: "over" as const },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/assistant", label: "Assistant", icon: MessageSquareText },
  { href: "/integrations", label: "Integrations", icon: Plug },
];

export function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

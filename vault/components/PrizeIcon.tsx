import { Shield, Sparkles, Gem, Gift, Package, type LucideIcon } from "lucide-react";
import type { ServiceType } from "@/lib/types";

const MAP: Record<ServiceType, LucideIcon> = {
  vpn: Shield,
  ai: Sparkles,
  points: Gem,
};

export default function PrizeIcon({
  type,
  className = "h-5 w-5",
}: {
  type: ServiceType;
  className?: string;
}) {
  const Icon = MAP[type] ?? Package;
  return <Icon className={className} strokeWidth={1.75} />;
}

export function CaseIcon({ isFree, className = "h-7 w-7" }: { isFree?: boolean; className?: string }) {
  const Icon: LucideIcon = isFree ? Gift : Package;
  return <Icon className={className} strokeWidth={1.5} />;
}

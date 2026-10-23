import {
  CheckBadgeIcon,
  LockClosedIcon,
  ScaleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface TrustBadge {
  label: string;
  description: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Single source of truth for the guarantees we advertise — shared by the
// homepage security section and the product page badges.
export const TRUST_BADGES: TrustBadge[] = [
  {
    label: "Cumplimiento RGPD",
    description: "Tus datos protegidos",
    Icon: ShieldCheckIcon,
  },
  {
    label: "Abogados Colegiados",
    description: "Redactado por expertos",
    Icon: ScaleIcon,
  },
  {
    label: "Pago Seguro SSL",
    description: "Transacción cifrada",
    Icon: LockClosedIcon,
  },
  {
    label: "ISO 9001",
    description: "Calidad certificada",
    Icon: CheckBadgeIcon,
  },
];

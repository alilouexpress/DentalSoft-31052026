const SUPABASE_BASE = "https://bvconuycpdvgzbvbkijl.supabase.co/storage/v1/object/public/sizes";

export const ICONS_3D = {
  star: `${SUPABASE_BASE}/17125d-star/dynamic/200/color.webp`,
  calender: `${SUPABASE_BASE}/0ef25b-calender/dynamic/200/color.webp`,
  heart: `${SUPABASE_BASE}/1acc3d-heart/dynamic/200/color.webp`,
  tools: `${SUPABASE_BASE}/ff5be0-tools/dynamic/200/color.webp`,
  lab: `${SUPABASE_BASE}/56180e-lab/dynamic/200/color.webp`,
  dollar: `${SUPABASE_BASE}/421bcd-dollar/dynamic/200/color.webp`,
  moneyBag: `${SUPABASE_BASE}/36f0c6-money-bag/dynamic/200/color.webp`,
  chart: `${SUPABASE_BASE}/4a4275-chart/dynamic/200/color.webp`,
  tick: `${SUPABASE_BASE}/1b714e-tick/dynamic/200/color.webp`,
  setting: `${SUPABASE_BASE}/7e47be-setting/dynamic/200/color.webp`,
  shield: `${SUPABASE_BASE}/b91186-shield/dynamic/200/color.webp`,
  bell: `${SUPABASE_BASE}/ef4a90-bell/dynamic/200/color.webp`,
  lock: `${SUPABASE_BASE}/457612-lock/dynamic/200/color.webp`,
  wallet: `${SUPABASE_BASE}/7d956f-wallet/dynamic/200/color.webp`,
  folder: `${SUPABASE_BASE}/176980-folder/dynamic/200/color.webp`,
  creditCard: `${SUPABASE_BASE}/11463e-credit-card/dynamic/200/color.webp`,
  clipboard: `${SUPABASE_BASE}/628100-notebook/dynamic/200/color.webp`,
  boy: `${SUPABASE_BASE}/a14880-boy/dynamic/200/color.webp`,
  rocket: `${SUPABASE_BASE}/744cc0-rocket/dynamic/200/color.webp`,
  target: `${SUPABASE_BASE}/49b6f4-target/dynamic/200/color.webp`,
  medal: `${SUPABASE_BASE}/39121b-medal/dynamic/200/color.webp`,
  fire: `${SUPABASE_BASE}/6bfe8c-fire/dynamic/200/color.webp`,
  bulb: `${SUPABASE_BASE}/ddbd61-bulb/dynamic/200/color.webp`,
  trophy: `${SUPABASE_BASE}/49654f-trophy/dynamic/200/color.webp`,
  crown: `${SUPABASE_BASE}/634b4b-crown/dynamic/200/color.webp`,
  check: `${SUPABASE_BASE}/1b714e-tick/dynamic/200/color.webp`,
  alert: `${SUPABASE_BASE}/313578-megaphone/dynamic/200/color.webp`,
  clock: `${SUPABASE_BASE}/8ef1fa-clock/dynamic/200/color.webp`,
} as const;

export type Icon3DKey = keyof typeof ICONS_3D;

interface ThreeDIconProps {
  icon: Icon3DKey;
  size?: number;
  className?: string;
  alt?: string;
}

export default function ThreeDIcon({ icon, size = 40, className = "", alt = "" }: ThreeDIconProps) {
  const src = ICONS_3D[icon];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt || icon}
      width={size}
      height={size}
      className={`object-contain select-none ${className}`}
      draggable={false}
      loading="lazy"
    />
  );
}

import type { ReactNode } from "react";

export type IconProps = { className?: string };

function Svg({ className = "h-6 w-6", children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* --- Tool icons ---------------------------------------------------------- */
export const IconPercent = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5.5 18.5 13-13" />
    <circle cx="7.2" cy="7.2" r="2.6" />
    <circle cx="16.8" cy="16.8" r="2.6" />
  </Svg>
);

export const IconGrade = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21.5 8.8 12 3.9 2.5 8.8 12 13.7Z" />
    <path d="M6 11.2v4.9c0 1.6 2.7 2.9 6 2.9s6-1.3 6-2.9v-4.9" />
    <path d="M21.5 8.8v5" />
  </Svg>
);

export const IconAge = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20.5h16" />
    <path d="M5.5 20.5v-6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6" />
    <path d="M12 8.8V6.2" />
    <path d="M12 3.5a1.4 1.4 0 0 1 1.4 1.4c0 1-1.4 1.9-1.4 1.9s-1.4-.9-1.4-1.9A1.4 1.4 0 0 1 12 3.5Z" />
    <path d="M9 12.5v6M15 12.5v6" />
  </Svg>
);

export const IconCalendarRange = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M8 3v3.5M16 3v3.5M3 10.5h18" />
    <path d="M7 14.5h3.5M13.5 14.5H17M7 17.5h3.5" />
  </Svg>
);

export const IconWordCount = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6.5h16M4 11h11M4 15.5h16M4 20h8" />
  </Svg>
);

export const IconCase = (p: IconProps) => (
  <Svg {...p}>
    <path d="m3.5 19 4.6-13 4.6 13" />
    <path d="M5.3 14.5h5.6" />
    <path d="M13.5 19h6.5M17 19v-8.5l-2.2 1.5" />
  </Svg>
);

export const IconDuplicate = (p: IconProps) => (
  <Svg {...p}>
    <rect x="9" y="9" width="11.5" height="11.5" rx="2" />
    <path d="M5.5 15.5h-1a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
    <path d="M12 13.5h5.5M12 16.5h3.5" />
  </Svg>
);

export const IconConvert = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20.5 7H3.5M6.5 4 3.5 7l3 3" />
    <path d="M3.5 17h17M17.5 14l3 3-3 3" />
  </Svg>
);

export const IconBudget = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="6" width="19" height="13.5" rx="2.5" />
    <path d="M2.5 10.5h19" />
    <path d="M16.5 15.2h2" />
  </Svg>
);

export const IconTimer = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 10v3.8l2.4 1.5M9.5 2.5h5M12 2.5v3.5" />
  </Svg>
);

export const IconCalculator = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4" y="2.5" width="16" height="19" rx="2.5" />
    <path d="M8 7h8M8 12h2M12 12h2M16 12h.5M8 16.5h2M12 16.5h2M16 16.5h.5" />
  </Svg>
);

/* --- UI icons ------------------------------------------------------------ */
export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.8" />
    <path d="m16.2 16.2 4.3 4.3" />
  </Svg>
);

export const IconMenu = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6 18 18M18 6 6 18" />
  </Svg>
);

export const IconSun = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4" />
  </Svg>
);

export const IconMoon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20.5 14.5A8.6 8.6 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
  </Svg>
);

export const IconChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);

export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12.8 4.6 4.6L19 7.4" />
  </Svg>
);

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.3l3.4 2" />
  </Svg>
);

export const IconInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5.2M12 7.8h.01" />
  </Svg>
);

export const IconGift = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="9.5" width="17" height="11.5" rx="1.6" />
    <path d="M2.5 6h19v3.5h-19z" />
    <path d="M12 6v15" />
    <path d="M12 6C10.5 3 7 2.8 7 5s3.6 1 5 1Zm0 0c1.5-3 5-3.2 5-1s-3.6 1-5 1Z" />
  </Svg>
);

export const IconNoAccount = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.4" />
    <path d="M5.8 19.8a6.5 6.5 0 0 1 12.4 0" />
    <path d="m4.5 20.5 15-17" />
  </Svg>
);

export const IconBolt = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13.2 2.5 4.8 13.6H11l-0.6 7.9L19.2 10H13Z" />
  </Svg>
);

export const IconDevices = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2.5" y="5" width="12.5" height="9" rx="1.6" />
    <path d="M6 18h6M9 14v4" />
    <rect x="17" y="8" width="4.5" height="10" rx="1.4" />
  </Svg>
);

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 7h16M9.5 7V4.8h5V7M6.5 7l1 13h9l1-13" />
  </Svg>
);

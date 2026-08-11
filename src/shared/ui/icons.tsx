import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 24, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconDiary = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v13" />
    <path d="M4 5.5V19a2 2 0 0 0 2 2h13" />
    <path d="M19 17H6.5a2.5 2.5 0 0 0 0 5" />
    <path d="M9 8h6" />
  </Icon>
);

export const IconStar = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
  </Icon>
);

export const IconUser = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
  </Icon>
);

export const IconPlus = (p: IconProps) => (
  <Icon strokeWidth={2.4} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const IconCamera = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.9a1 1 0 0 0 .84-.46l.92-1.42a1 1 0 0 1 .84-.46h4a1 1 0 0 1 .84.46l.92 1.42a1 1 0 0 0 .84.46h1.9A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />
    <circle cx="12" cy="13" r="3.6" />
  </Icon>
);

export const IconMic = (p: IconProps) => (
  <Icon {...p}>
    <rect x="9" y="2.5" width="6" height="11.5" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
    <path d="M12 18v3.5" />
  </Icon>
);

export const IconText = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 6.5V5h14v1.5" />
    <path d="M12 5v14" />
    <path d="M9 19h6" />
  </Icon>
);

export const IconPencil = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16.5 3.9a2.1 2.1 0 0 1 3 3L8 18.4l-4 1 1-4z" />
    <path d="m14.5 5.9 3 3" />
  </Icon>
);

export const IconTrash = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 6.5h16" />
    <path d="M9.5 6.5V4.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.7" />
    <path d="M6.5 6.5 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5l.9-12.5" />
  </Icon>
);

export const IconChevronLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.5 5.5 8 12l6.5 6.5" />
  </Icon>
);

export const IconChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9.5 5.5 16 12l-6.5 6.5" />
  </Icon>
);

export const IconClose = (p: IconProps) => (
  <Icon strokeWidth={2.1} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const IconCheck = (p: IconProps) => (
  <Icon strokeWidth={2.4} {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Icon>
);

export const IconSearch = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Icon>
);

export const IconRepeat = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9.5A4.5 4.5 0 0 1 8.5 5H19" />
    <path d="m16 2 3.5 3L16 8" />
    <path d="M20 14.5a4.5 4.5 0 0 1-4.5 4.5H5" />
    <path d="m8 16-3.5 3L8 22" />
  </Icon>
);

export const IconWarning = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4.5 21 19.5H3z" />
    <path d="M12 10v4" />
    <path d="M12 17h.01" />
  </Icon>
);

export const IconOffline = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 3l18 18" />
    <path d="M8.5 15.5a5 5 0 0 1 7 0" />
    <path d="M5 12a10 10 0 0 1 3.6-2.4" />
    <path d="M19 12a10 10 0 0 0-8.5-2.9" />
    <path d="M12 19h.01" />
  </Icon>
);

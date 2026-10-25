import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4.2-4.2" />
  </Icon>
);
export const MenuIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h11M4 17h16" />
  </Icon>
);
export const CloseIcon = (p: P) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);
export const ArrowRight = (p: P) => (
  <Icon className="arrow" {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const PlayIcon = (p: P) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.2-6.5a1 1 0 0 0 0-1.8L9.5 4.6A1 1 0 0 0 8 5.5z" />
  </svg>
);
export const YouTubeIcon = (p: P) => (
  <Icon {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="4" />
    <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" />
  </Icon>
);
export const InstagramIcon = (p: P) => (
  <Icon {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r=".6" fill="currentColor" />
  </Icon>
);
export const TikTokIcon = (p: P) => (
  <Icon {...p}>
    <path d="M14 3.5v11a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M14 3.5c.4 2.6 2.2 4.4 5 4.6" />
  </Icon>
);
export const PinterestIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M10.5 20.2l1.9-8.2M9.4 13.6c-.9-2.9 1-5.6 3.6-5.6 2.3 0 3.6 1.6 3.4 3.7-.2 2.3-1.6 4-3.3 4-1 0-1.6-.6-1.6-.6" />
  </Icon>
);
export const SpotifyIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M7.5 9.6c3-1 6.4-.7 9 .9M8.2 12.6c2.4-.7 5-.4 7 .8M8.9 15.4c1.9-.5 3.7-.3 5.2.6" />
  </Icon>
);
export const MailIcon = (p: P) => (
  <Icon {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="M3.5 7l8.5 6 8.5-6" />
  </Icon>
);
export const LinkIcon = (p: P) => (
  <Icon {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </Icon>
);
export const WhatsAppIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 20l1.3-4A8 8 0 1 1 8 18.8z" />
    <path d="M9 9.5c.3 2 2.5 4.3 4.6 4.8l1.1-1.1 1.8.9c-.2 1.2-1.2 1.9-2.4 1.8-3.5-.4-6.4-3.3-6.8-6.8-.1-1.2.6-2.2 1.8-2.4l.9 1.8z" />
  </Icon>
);
export const ShareIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 3.5v11M8 7.5l4-4 4 4" />
    <path d="M6 12v6.5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V12" />
  </Icon>
);
export const FacebookIcon = (p: P) => (
  <Icon {...p}>
    <path d="M14.5 8H17V4.5h-2.5a4 4 0 0 0-4 4V11H8v3.5h2.5v6h3.5v-6H17l.5-3.5H14V8.5a.5.5 0 0 1 .5-.5z" />
  </Icon>
);

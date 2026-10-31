import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function ServiceIcon({ kind, ...props }: IconProps & { kind: string }) {
  const paths: Record<string, string> = {
    eraser: "m4 13 9-9a2 2 0 0 1 3 0l4 4a2 2 0 0 1 0 3l-9 9H7l-3-3a3 3 0 0 1 0-4Zm5-5 7 7M11 20h10",
    sun: "M15 12a4 4 0 1 1-4-4M11 2v2M3 10H1m4-6 1.5 1.5M4 18l1.5-1.5M11 20v2m6-4-1.5-1.5M18 2l1.1 3.9L23 7l-3.9 1.1L18 12l-1.1-3.9L13 7l3.9-1.1L18 2Z",
    follicle: "M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Zm2 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
    waves: "M3 6c3-4 5 4 9 0s6 4 9 0M3 12c3-4 5 4 9 0s6 4 9 0M3 18c3-4 5 4 9 0s6 4 9 0",
    sparkles: "m10 3 2.2 6.8L19 12l-6.8 2.2L10 21l-2.2-6.8L1 12l6.8-2.2L10 3Zm10-1 .7 2.3L23 5l-2.3.7L20 8l-.7-2.3L17 5l2.3-.7L20 2Zm0 14 .8 2.2L23 19l-2.2.8L20 22l-.8-2.2L17 19l2.2-.8L20 16Z",
    smile: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM8 9h.01M16 9h.01M8 14a4.5 4.5 0 0 0 8 0",
    pen: "m4 16 11-11 4 4L8 20l-5 1 1-5Zm9-9 4 4M15 5l2-2a2 2 0 0 1 3 0l1 1a2 2 0 0 1 0 3l-2 2M6 16l2 2M3 22l-1 1",
    scan: "M3 7V3h4M17 3h4v4M21 17v4h-4M7 21H3v-4M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[kind] || paths.sparkles} /></svg>;
}

export function InstagramIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" {...props}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" /></svg>;
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3 20l.9-4.9a8.4 8.4 0 1 1 16.6-3.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M8.3 7.8c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.5.7c-.2.2-.2.3-.1.5.5.9 1.2 1.6 2.1 2.1.2.1.4.1.5-.1l.8-.9c.2-.2.4-.3.6-.2l1.6.8c.2.1.4.2.4.4 0 .3-.2 1.3-.7 1.7-.5.5-1.2.7-2 .6-1-.1-2.2-.6-3.6-1.8-1.6-1.4-2.6-3.1-2.8-4.1-.3-1 .1-1.7.4-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M7 17 17 7M7 7h10v10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

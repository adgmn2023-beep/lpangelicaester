"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { trackConversion } from "./analytics";

type WhatsAppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

export function WhatsAppLink({ href, onClick, children, ...props }: WhatsAppLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    trackConversion("whatsapp");

    const url = new URL(href);
    const currentParams = new URLSearchParams(window.location.search);
    for (const [key, value] of currentParams) {
      if (/^(utm_[a-z0-9_]+|gclid|gbraid|wbraid)$/i.test(key)) {
        url.searchParams.set(key, value);
      }
    }
    event.currentTarget.href = url.toString();
  }

  return (
    <a href={href} onClick={handleClick} {...props} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

type TrackedLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  action: "phone" | "directions";
  children: ReactNode;
  external?: boolean;
};

export function TrackedLink({
  href,
  action,
  children,
  external = false,
  onClick,
  ...props
}: TrackedLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (!event.defaultPrevented) trackConversion(action);
  }

  const anchorProps = {
    href,
    onClick: handleClick,
    ...(external ? { target: "_blank", rel: "noopener noreferrer" } : {}),
    ...props,
  };

  if (external) {
    return (
      <a {...anchorProps}>
        {children}
      </a>
    );
  }

  return (
    <Link {...anchorProps}>
      {children}
    </Link>
  );
}

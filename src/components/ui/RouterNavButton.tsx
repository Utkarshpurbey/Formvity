"use client";

import { useRouter } from "next/navigation";
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";

type RouterNavButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  href: string;
  replace?: boolean;
  children: ReactNode;
  /** Called after click, before navigation (e.g. close mobile menu). */
  onNavigate?: () => void;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

/**
 * Programmatic client navigation via the App Router.
 * @see https://nextjs.org/docs/app/api-reference/functions/use-router
 */
export function RouterNavButton({
  href,
  replace = false,
  children,
  onNavigate,
  onClick,
  type = "button",
  ...props
}: RouterNavButtonProps) {
  const router = useRouter();

  return (
    <button
      type={type}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        onNavigate?.();
        if (replace) router.replace(href);
        else router.push(href);
      }}
    >
      {children}
    </button>
  );
}

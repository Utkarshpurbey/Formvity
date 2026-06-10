"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { withAppBasePath } from "../../utils/appBasePath";

type AppLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  children: ReactNode;
  className?: string;
};

/** Internal navigation with Next.js prefetch (faster route transitions). */
export function AppLink({ href, children, className, prefetch = true, ...rest }: AppLinkProps) {
  return (
    <Link href={withAppBasePath(href)} prefetch={prefetch} className={className} {...rest}>
      {children}
    </Link>
  );
}

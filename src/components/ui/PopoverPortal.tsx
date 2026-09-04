"use client";

import {
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

export type PopoverPortalProps = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  placement?: "bottom-start" | "top-start";
  offset?: number;
  width?: number;
  className?: string;
  children: ReactNode;
  portalRef?: RefObject<HTMLDivElement>;
  onClick?: (e: React.MouseEvent) => void;
};

const ESTIMATED_HEIGHT = 320;

export function PopoverPortal({
  open,
  anchorRef,
  placement = "bottom-start",
  offset = 4,
  width = 256,
  className = "",
  children,
  portalRef,
  onClick,
}: PopoverPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<CSSProperties | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) {
      setPosition(null);
      return;
    }

    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let openUp = placement === "top-start";
      if (placement === "bottom-start") {
        openUp = spaceBelow < ESTIMATED_HEIGHT && spaceAbove > spaceBelow;
      }

      const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8);

      if (openUp) {
        setPosition({
          position: "fixed",
          top: rect.top - offset,
          left,
          width,
          transform: "translateY(-100%)",
          zIndex: 200,
        });
      } else {
        setPosition({
          position: "fixed",
          top: rect.bottom + offset,
          left,
          width,
          zIndex: 200,
        });
      }
    };

    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, anchorRef, placement, offset, width]);

  if (!mounted || !open || !position) return null;

  return createPortal(
    <div ref={portalRef} className={className} style={position} onClick={onClick}>
      {children}
    </div>,
    document.body,
  );
}

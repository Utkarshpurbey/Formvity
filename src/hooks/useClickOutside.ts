import { useEffect, type RefObject } from "react";

/** Close popovers/menus when clicking outside `containerRef`. */
export function useClickOutside(containerRef: RefObject<HTMLElement | null>, onClose: () => void, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [containerRef, onClose, active]);
}

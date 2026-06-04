"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setVisible(true);
    setWidth(18);
    const t1 = window.setTimeout(() => setWidth(62), 80);
    const t2 = window.setTimeout(() => setWidth(88), 220);
    const t3 = window.setTimeout(() => {
      setWidth(100);
      window.setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 280);
    }, 380);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [pathname]);

  if (!visible && width === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 origin-left bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.45)] transition-[width,opacity] duration-300 ease-out"
      style={{ width: `${width}%`, opacity: visible ? 1 : 0 }}
    />
  );
}

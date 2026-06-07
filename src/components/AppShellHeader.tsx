"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { logoutUser } from "../store/slices/authSlice";
import { stripAppBasePath } from "../utils/appBasePath";
import { Spinner } from "./ui/Spinner";

/** Signed-in maker nav — shared forms for respondents will live on public links later, not here. */
const workspaceNav = [
  { href: "/workspaces", label: "Workspaces" },
  { href: "/templates", label: "Templates" },
  { href: "/builder", label: "Builder" },
];

/** Marketing / signed-out only (no internal dev tools). */
const exploreNav = [
  { href: "/home", label: "Home" },
  { href: "/templates", label: "Templates" },
];

function navLinkClass(active: boolean) {
  return `rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
    active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;
}

function initials(user: { displayName: string; email?: string }) {
  const parts = user.displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]!}${parts[parts.length - 1]![0]!}`.toUpperCase();
  }
  if (user.displayName.trim().length >= 2) return user.displayName.trim().slice(0, 2).toUpperCase();
  return (user.email ?? "U").slice(0, 2).toUpperCase();
}

export function AppShellHeader() {
  const pathname = usePathname() ?? "/";
  const routePath = stripAppBasePath(pathname);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, ready } = useAppSelector((s) => s.auth);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const guestMenuRef = useRef<HTMLDivElement>(null);
  const userMobilePanelRef = useRef<HTMLDivElement>(null);

  const closeMenus = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (guestMenuRef.current?.contains(t)) return;
      if (userMobilePanelRef.current?.contains(t)) return;
      if ((e.target as Element).closest?.("[data-guest-menu-trigger]")) return;
      closeMenus();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen, closeMenus]);

  const handleLogout = () => {
    dispatch(logoutUser());
    closeMenus();
    toast.info("Signed out.");
    router.push("/home");
  };

  const isHome = routePath === "/home";
  const userLabel = user?.displayName ?? "Account";
  const primaryNav = user ? workspaceNav : exploreNav;

  if (!ready) {
    return (
      <header className="sticky top-0 z-40 h-14 shrink-0 border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-100" aria-hidden />
          <Spinner size="sm" label="Loading account" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-slate-200/90 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-6 md:gap-8">
          <Link href="/home" className="flex shrink-0 items-center gap-2.5 rounded-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-indigo-500">
            <div
              className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20"
              aria-hidden
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z" />
              </svg>
            </div>
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-semibold tracking-tight text-slate-900">Formvity</p>
              <p className="hidden text-[11px] font-medium text-slate-500 sm:block">Form builder</p>
            </div>
          </Link>

          <nav className="hidden min-w-0 items-center gap-0.5 md:flex" aria-label="Primary">
            {primaryNav.map(({ href, label }) => (
              <Link key={href} href={href} aria-current={routePath === href ? "page" : undefined} className={navLinkClass(routePath === href || (href === "/workspaces" && routePath.startsWith("/workspaces")))}>
                {label}
              </Link>
            ))}
            {user && isHome ? (
              <Link href="/home" className={navLinkClass(true)}>
                Home
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <div className="relative flex items-center gap-2" ref={menuRef}>
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-expanded={menuOpen}
                  className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 py-1.5 pl-1.5 pr-2.5 text-left transition hover:border-slate-300 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-sm">
                    {initials(user)}
                  </span>
                  <span className="max-w-[9rem] truncate text-sm font-medium text-slate-800">{userLabel}</span>
                  <span className="text-slate-400" aria-hidden>
                    ▾
                  </span>
                </button>
                {menuOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-slate-200/80 bg-white py-1.5 shadow-lg shadow-slate-900/10"
                  >
                    <p className="border-b border-slate-100 px-3 py-2 text-xs text-slate-500">Signed in</p>
                    {!isHome && user.email ? (
                      <p className="truncate px-3 pb-2 text-sm font-medium text-slate-900">{user.email}</p>
                    ) : null}
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
                      onClick={handleLogout}
                    >
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-indigo-700 sm:hidden"
              >
                {initials(user)}
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Get started
              </Link>
              <button
                type="button"
                data-guest-menu-trigger
                aria-label="Open menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((o) => !o)}
                className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 md:hidden"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  {menuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {menuOpen && !user ? (
        <div ref={guestMenuRef} className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {exploreNav.map(({ href, label }) => (
              <Link key={href} href={href} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
            <Link href="/login" className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
              Log in
            </Link>
          </nav>
        </div>
      ) : null}

      {menuOpen && user ? (
        <div ref={userMobilePanelRef} className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {(user ? workspaceNav : exploreNav).map(({ href, label }) => (
              <Link key={href} href={href} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
            {user && isHome ? (
              <Link href="/home" className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
            ) : null}
            <button type="button" className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50" onClick={handleLogout}>
              Sign out
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

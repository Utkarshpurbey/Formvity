"use client";

import { useState } from "react";
import { useAppSelector } from "../../store/hooks";
import type { ChartViewMode } from "../form/analytics/ChartViewToggle";
import {
  HomeAnalytics,
  HomeCta,
  HomeFaq,
  HomeFeatures,
  HomeFooter,
  HomeHero,
  HomeLogoStrip,
  HomeUseCases,
  HomeValueProps,
  HomeWalkthrough,
  HomeWorkflow,
} from "./HomeSections";

export function HomePage() {
  const user = useAppSelector((s) => s.auth.user);
  const [demoChartView, setDemoChartView] = useState<ChartViewMode>("pie");

  const primaryCta = user
    ? { label: "Open workspaces", href: "/workspaces" }
    : { label: "Start free", href: "/register" };
  const secondaryCta = user
    ? { label: "Browse templates", href: "/templates" }
    : { label: "View templates", href: "/templates" };

  return (
    <main className="min-h-0 flex-1 overflow-y-auto scroll-smooth">
      <HomeHero cta={{ primary: primaryCta, secondary: secondaryCta }} />
      <HomeLogoStrip />
      <HomeValueProps />
      <HomeFeatures />
      <HomeWorkflow />
      <HomeWalkthrough />
      <HomeAnalytics demoChartView={demoChartView} onChartViewChange={setDemoChartView} />
      <HomeUseCases />
      <HomeFaq />
      <HomeCta user={Boolean(user)} primaryCta={primaryCta} />
      <HomeFooter />
    </main>
  );
}

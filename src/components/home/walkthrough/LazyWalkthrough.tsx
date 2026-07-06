"use client";

import dynamic from "next/dynamic";
import { WalkthroughPlaceholder } from "./WalkthroughPlaceholder";

/** Code-split & cached — not in the main home bundle. */
export const LazyWalkthroughFull = dynamic(
  () => import("./ProductWalkthrough").then((m) => ({ default: m.ProductWalkthrough })),
  {
    loading: () => <WalkthroughPlaceholder variant="full" />,
    ssr: false,
  },
);

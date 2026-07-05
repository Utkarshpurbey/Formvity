import { ImageResponse } from "next/og";
import { siteConfig } from "../src/lib/seo";

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background: "linear-gradient(135deg, #0f172a 0%, #312e81 45%, #0e7490 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
            fontSize: "28px",
            fontWeight: 700,
            color: "#c4b5fd",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 800,
            }}
          >
            F
          </div>
          Formvity
        </div>
        <div style={{ fontSize: "64px", fontWeight: 800, lineHeight: 1.05, maxWidth: "900px" }}>
          Build forms. Understand every response.
        </div>
        <div style={{ marginTop: "28px", fontSize: "30px", lineHeight: 1.4, color: "#cbd5e1", maxWidth: "860px" }}>
          Visual form builder with templates, publish workflows, and analytics built in.
        </div>
      </div>
    ),
    { ...size },
  );
}

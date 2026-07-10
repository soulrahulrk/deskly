import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 60%, #24243e 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#4f46e5",
              color: "white",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            D
          </div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "white" }}>
            Deskly
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 60,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.15,
            maxWidth: 980,
          }}
        >
          The support desk your team will actually enjoy
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 28,
            color: "#a1a1c9",
            maxWidth: 820,
          }}
        >
          Fast ticketing, real analytics, and role-based access — open source, MIT licensed.
        </div>
      </div>
    ),
    { ...size },
  );
}

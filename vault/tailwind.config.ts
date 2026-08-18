import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0B12",
        surface: "#14151F",
        surface2: "#1F2233",
        line: "#262A3D",
        ink: "#EDEAF6",
        muted: "#8D8AA3",
        gold: "#E8B04B",
        violet: "#8C6FFF",
        danger: "#FF6B6B",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(232,176,75,0.35)",
        violetGlow: "0 0 40px -8px rgba(140,111,255,0.35)",
        sheet: "0 -24px 60px -20px rgba(0,0,0,0.65)",
        card: "0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 24px -12px rgba(0,0,0,0.5)",
      },
      keyframes: {
        sheetUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        popIn: {
          "0%": { transform: "scale(0.92)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        confettiFall: {
          "0%": { transform: "translateY(-12px) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(160px) rotate(540deg)", opacity: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        dialTick: {
          "0%, 100%": { transform: "rotate(-8deg)" },
          "50%": { transform: "rotate(8deg)" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(140,111,255,0.45)" },
          "100%": { boxShadow: "0 0 0 10px rgba(140,111,255,0)" },
        },
      },
      animation: {
        sheetUp: "sheetUp 0.32s cubic-bezier(0.16,1,0.3,1)",
        fadeIn: "fadeIn 0.2s ease-out",
        popIn: "popIn 0.32s cubic-bezier(0.34,1.56,0.64,1)",
        confetti: "confettiFall 1.1s ease-in forwards",
        shimmer: "shimmer 1.8s linear infinite",
        dialTick: "dialTick 2.6s ease-in-out infinite",
        pulseRing: "pulseRing 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

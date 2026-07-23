import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101113",
        panel: "#181b20",
        line: "#2b3038",
        mint: "#4f8cff",
        ember: "#f9735b",
        amber: "#f7c56b",
        sky: "#38d5f5",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(79,140,255,0.22), 0 24px 60px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;

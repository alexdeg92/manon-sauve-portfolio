import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF8F5",
        warm: "#F5F0EB",
        charcoal: "#2C2C2C",
        muted: "#6B6B6B",
        accent: "#8B7355",
        "accent-light": "#C4A882",
      },
      fontFamily: {
        serif: ["Cormorant Garant", "Georgia", "serif"],
        "serif-sc": ["Cormorant SC", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

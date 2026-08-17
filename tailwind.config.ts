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
        // Mobile view palette — see "Application Mobile" design
        m: {
          ink: "#17181A",
          paper: "#FBFAF7",
          shell: "#E8E5DE",
          sand: "#EDE9E1",
          "sand-soft": "#F4F1EA",
          line: "#E6E1D7",
          "line-strong": "#E0DBD1",
          stone: "#8A857C",
          "stone-soft": "#A9A49A",
          "stone-deep": "#4B4842",
          quiet: "#77736B",
          sage: "#4A6B4F",
          "sage-soft": "#C4D3C6",
          "sage-pale": "#B9CBBC",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garant", "Georgia", "serif"],
        "serif-sc": ["Cormorant SC", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Bricolage Grotesque", "system-ui", "sans-serif"],
        editorial: ["Newsreader", "Georgia", "serif"],
      },
      keyframes: {
        mFade: { from: { opacity: "0" }, to: { opacity: "1" } },
        mRise: {
          from: { opacity: "0", transform: "translateY(26px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        mFade: "mFade .45s ease both",
        mRise: "mRise .5s cubic-bezier(.16,1,.3,1) both",
      },
    },
  },
  plugins: [],
};
export default config;

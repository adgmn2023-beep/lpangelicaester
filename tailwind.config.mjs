/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        primary: "var(--primary)",
        "bronze-light": "var(--bronze-light)",
        "bronze-dark": "var(--bronze-dark)",
        bg: "var(--bg)",
        "bg-soft": "var(--bg-soft)",
        rose: "var(--rose)",
        bronze: "var(--bronze)",
        "on-ink": "var(--text-on-ink)",
        "muted-on-ink": "var(--muted-on-ink)",
        body: "var(--text)",
        heading: "var(--heading)",
        accent: "var(--accent)",
        muted: "var(--muted)",
        line: "var(--line)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Arial", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [],
};

export default config;

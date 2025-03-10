import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      backgroundColor: {
        primaryColor: "#ffffff",
        secondColor: "#333333",
        blueColor: "#0a84ff",
        supportGreen: "#2ed47a",
        supportOrange: "#ffa500"
      },
      textColor: {
        primaryColor: "#f5f7f9",
        secondColor: "#0a84ff",
        supportGreen: "#2ed47a",
        supportOrange: "#ffa500"
      },
      borderColor: {
        primaryColor: "#f5f7f9",
        secondColor: "#0a84ff",
        supportGreen: "#2ed47a",
        supportOrange: "#ffa500"
      },
      maxWidth: {
        container:"1240px"
      }
    },
  },
  plugins: [],
} satisfies Config;

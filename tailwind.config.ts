import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
    "./src/hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "Noto Sans KR",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      colors: {
        aibeop: {
          bg: "#F5F8F4",
          canvas: "#EEF4EF",
          surface: "#FFFDF8",
          card: "#FFFFFF",
          soft: "#E7F0EA",
          line: "#D4E2D9",
          text: "#18231D",
          muted: "#5F7166",
          green: "#2F6B4F",
          deep: "#1F4C38",
          pale: "#DCEFE1",
          accent: "#8FB89E",
          accentSoft: "#F1F7F2",
        },
      },
      boxShadow: {
        soft: "0 10px 30px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
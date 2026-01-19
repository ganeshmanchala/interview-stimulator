module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      colors: {
        primary: { DEFAULT: "#6C5CE7" }, // adjust as needed
        background: "hsl(222 84% 98%)",
        foreground: "hsl(210 40% 6%)",
        muted: { DEFAULT: "hsl(220 10% 60%)" },
        card: "rgba(255,255,255,0.6)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(90deg,#6C5CE7 0%,#00B4DB 100%)",
        "gradient-hero": "linear-gradient(90deg,#6C5CE7,#3B82F6 60%)",
      },
      boxShadow: {
        glow: "0 8px 30px rgba(108,92,231,0.14)",
        card: "0 6px 24px rgba(16,24,40,0.05)",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-8px)" } },
      },
      animation: { float: "float 3s ease-in-out infinite" },
      borderRadius: { lg: "12px", md: "10px", sm: "8px" }
    },
  },
  plugins: [],
};

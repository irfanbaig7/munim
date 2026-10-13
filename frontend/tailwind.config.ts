import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4F7FB",   // bahi ka kagaz
        ink: "#14213D",     // pen ki syahi
        rule: "#C9D6EA",    // bahi ki neeli lines
        khata: "#B3261E",   // bahi ka laal margin / udhaar
        haldi: "#F2B705",   // main button
        haldidark: "#D99F00",
        mute: "#5B6B8A",
      },
      fontFamily: {
        display: ['"Baloo 2"', "system-ui", "sans-serif"],
        body: ["Mukta", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

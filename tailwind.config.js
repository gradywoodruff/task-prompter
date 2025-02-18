/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', "monospace"]
      },
      fontSize: {
        "2xs": ["0.5rem", "0.625rem"]
      }
    }
  },
  plugins: []
}

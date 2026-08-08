/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#192b58',
          dark: '#0f1a38',
          deep: '#0d152a',
          light: '#243a75',
        },
        gold: {
          DEFAULT: '#ffcb04',
          hover: '#e5b600',
          light: '#ffe066',
        },
        darkbg: '#0a0a0a',
        darkcard: '#121624',
      },
      fontFamily: {
        // STRICT SERIF TYPOGRAPHY SYSTEM (NO SANS-SERIF)
        serif: ['Playfair Display', 'Times CG', 'Times New Roman', 'Georgia', 'serif'],
        sans: ['Times CG', 'Playfair Display', 'Times New Roman', 'Georgia', 'serif'],
        playfair: ['Playfair Display', 'Times New Roman', 'Georgia', 'serif'],
        argent: ['Argent CF', 'Times CG', 'Playfair Display', 'serif'],
        timescg: ['Times CG', 'Times New Roman', 'Georgia', 'serif'],
        masvis: ['Masvis', 'Playfair Display', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}

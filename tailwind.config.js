/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        hand: ['Caveat', 'cursive'],
        pacifico: ['Pacifico', 'cursive'],
        patrick: ['Patrick Hand', 'cursive'],
        kalam: ['Kalam', 'cursive'],
        reenie: ['Reenie Beanie', 'cursive'],
      },
    },
  },
  plugins: [],
};

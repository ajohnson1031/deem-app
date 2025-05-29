/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,ts,tsx}', './src/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter'],
        'inter-light': ['Inter-Light'],
        'inter-medium': ['Inter-Medium'],
        'inter-semibold': ['Inter-SemiBold'],
        'inter-bold': ['Inter-Bold'],
      },
    },
  },
  plugins: [],
};

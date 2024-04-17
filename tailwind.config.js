/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  daisyui: {
    themes: ["synthwave", "light", "dark", "sunset", "night", "winter", "forest", "sea", "love", "cupcake", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "sky", "lofi", "pastel", "dracula"],
    darkTheme: "dark", // name of one of the included themes for dark mode
    base: false, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ":root", // The element that receives theme color CSS variables
  },
  theme: {
    extend: {
      colors: {
        'mmblue': '#053C5E',
        'mmsand': '#DFB48C',
        'mmcream': '#FFF4E0',
        'mmpurple': '#30011E',
        'mmgrey': '#2c2c2c'
      },
      boxShadow: {
        'landinglogin': '2px 4px 0px 1px rgba(0,0,0,0.76);',
        'reservebtn': '2px 2px 0px 1px #FFF4E0;',
      },
      backgroundImage: {
        'landingbg': './assets/bg.jpg',
        backdropBlur: ['responsive']
      }
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-outline': {
          textShadow: '0 0 2px #000, 0 0 3px #000',
        },
      }
      addUtilities(newUtilities)
    },
    require("daisyui"),
  ],
}
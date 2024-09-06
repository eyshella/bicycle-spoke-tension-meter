import type { Config } from "tailwindcss";
import * as colors from '@mui/material/colors'

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      ...colors,
      white: '#ffffff'
    }
  },
  plugins: [],
};
export default config;

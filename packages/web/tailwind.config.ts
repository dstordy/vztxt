import type { Config } from "tailwindcss";
import daisyui from "daisyui";
import * as themes from "daisyui/src/theming/themes";

export default {
  content: ["./index.html", "./src/**/*.ts"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        theme: {
          ...themes.default.business,
          "--btn-focus-scale": "0.99",
        },
      },
    ],
  },
} satisfies Config;

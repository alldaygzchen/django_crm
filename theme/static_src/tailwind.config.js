/**
 * This is a minimal config.
 *
 * If you need the full config, get it from here:
 * https://unpkg.com/browse/tailwindcss@latest/stubs/defaultConfig.stub.js
 */

module.exports = {
  purge: {
    enabled: true,
    content: [
      // Templates within theme app (e.g. base.html)
      "../templates/**/*.html",
      // Templates in other apps. Uncomment the following line if it matches
      // your project structure or change it to match.
      "../../templates/**/*.html",
      "../../agents/templates/**/*.html",
      "../../leads/templates/**/*.html",
    ],
    options: {
      safelist: [
        "bg-green-50",
        "border-green-400",
        "bg-blue-50",
        "border-blue-400",
        "bg-yellow-50",
        "border-yellow-400",
        "bg-red-50",
        "border-red-400",
        "text-green-700",
        "text-blue-700",
        "text-yellow-700",
        "text-red-700",
      ],
    },
  },
  theme: {
    extend: {},
  },
  plugins: [
    /**
     * '@tailwindcss/forms' is the forms plugin that provides a minimal styling
     * for forms. If you don't like it or have own styling for forms,
     * comment the line below to disable '@tailwindcss/forms'.
     */
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
    require("@tailwindcss/aspect-ratio"),
  ],
};

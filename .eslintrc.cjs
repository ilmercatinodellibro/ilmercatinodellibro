module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  root: true,

  // .eslintignore can't be extended as the same way as .eslintrc.js, so we put the common patterns here
  ignorePatterns: ["dist", "node_modules", ".eslintrc.cjs"],

  globals: {
    //Should be removed once defineModel is released
    //in stable version from experimental version
    defineModel: "readonly",
  },

  extends: ["coralloy", "coralloy/vue-i18n"],

  // add your custom rules here
  rules: {
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-console": [
      process.env.NODE_ENV === "production" ? "error" : "warn",
      { allow: ["error"] },
    ],
    "object-shorthand": ["error", "always"],

    "vue/no-unsupported-features": [
      "error",
      { version: require("vue").version },
    ],

    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
      },
    ],
  },

  settings: {
    "import/resolver": {
      typescript: {
        project: ["./tsconfig.json", "packages/*/tsconfig.json"],
      },
    },
  },
};

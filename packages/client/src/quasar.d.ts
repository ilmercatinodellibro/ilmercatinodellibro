declare module "quasar" {
  interface CustomColors {
    "facebook-blue": string;
  }
}

// Makes this file a module, so `declare module "quasar"` augments the package instead of replacing it
// eslint-disable-next-line unicorn/require-module-specifiers
export {};

// Forces TS to apply `@quasar/app-vite` augmentations of `quasar` package
// Removing this would break `quasar/wrappers` imports as those typings are declared
//  into `@quasar/app-vite`
// As a side effect, since `@quasar/app-vite` reference `quasar` to augment it,
//  this declaration also apply `quasar` own
//  augmentations (eg. adds `$q` into Vue component context)
/// <reference types="@quasar/app-vite" />

declare module "quasar" {
  interface CustomColors {
    "facebook-blue": string;
  }
}

// Makes this file a module, so `declare module "quasar"` augments the package instead of replacing it
// eslint-disable-next-line unicorn/require-module-specifiers
export {};

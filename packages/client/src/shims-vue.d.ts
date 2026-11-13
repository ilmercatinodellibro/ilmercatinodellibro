/// <reference types="vite/client" />

// Mocks all files ending in `.vue` showing them as plain Vue instances
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // Shim from the @quasar/app-vite 1 scaffold, vue-tsc uses the real component types
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

import { InjectionKey, Ref } from "vue";

export const IsLayoutHeaderXsInjectionKey = Symbol() as InjectionKey<
  Ref<boolean>
>;

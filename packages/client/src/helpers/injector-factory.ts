import { inject, InjectionKey, provide } from "vue";

function getValueFromMaybeFunction<
  Args extends unknown[],
  Provided,
  T = Provided extends (...args: Args) => infer R ? R : Provided,
>(params: Args, valueOrFn: Provided): T {
  // TS isn't able to narrow down correctly `T | () => T` types as infer `ReturnType<Function>` as any
  // See: https://github.com/microsoft/TypeScript/issues/37663
  // See: https://github.com/microsoft/TypeScript/issues/37993#issuecomment-615369691
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return valueOrFn instanceof Function ? valueOrFn(params) : valueOrFn;
}

/**
 * Generates a type-safe provider-injector pair.
 *
 * Use this helper when you need to share a good chunk of state (refs, methods, etc)
 * between a parent component and its children, especially when they're deeply nested.
 * Eg. instantiate a composable and provide its state to a deeply nested subtree of recursive components.
 *
 * Do not use this helper if you can get the same behaviour via props+events,
 * eg. when you only need to share a ref.
 *
 * If you provide a function, the injector method will automatically call
 * it for you passing through all parameters you provide to it.
 * In all other cases, the provided value is returned as it has been provided.
 *
 * A human-readable unique injection key is generated based on the name you provide to ease debugging.
 * The injector function will throw a meaningful error when trying to inject a value
 * which has not been provided.
 * The provider simply wraps native `provide` for convenience and to
 * avoid exposing the underlying injection key.
 *
 * @example
 * // src/composables/library.ts
 * export function useLibrary(libraryId: string) {
 *   const bookshelves: reactive({
 *     'narrative': { ... },
 *     'science': { ... },
 *   })
 *
 *   // Creating a `useLibrary` instance will automatically provide the helper function
 *   // to access topic-related slices of its internal state
 *   provideBookshelf((bookshelfId: string) => toRefs(bookshelves[bookshelfId]));
 *
 *   function getStats() {
 *     // .. ah-ah business
 *   }
 *
 *   return {
 *     // ... other stuff
 *     getStats
 *   }
 * }
 *
 * // When providing a function
 * export const {
 *   provider: provideBookshelf,
 *   injector: injectBookshelf,
 * } = injectorFactory<
 *   (bookshelfId: string) => ToRefs<Record<string, any>>
 * >('bookshelf');
 *
 * // When providing a plain object
 * export const {
 *   provider: provideLibrary,
 *   injector: injectLibrary,
 * } = injectorFactory<ReturnType<typeof useLibrary>>(
 *   'library'
 * );
 *
 * // src/components/library.vue
 * const libraryComposable = useLibrary('80085');
 * provideLibrary(libraryComposable)
 *
 * // src/components/library-stats.vue
 * const { getStats } = injectLibrary()
 *
 * // src/components/narrative-bookshelf.vue
 * const bookshelf = injectBookshelf('narrative')
 *
 * // src/components/science-bookshelf.vue
 * const bookshelf = injectBookshelf('science')
 */
export function injectorFactory<T>(name: string) {
  const key: InjectionKey<T> = Symbol(`${name}-injection-key`);

  function provider(value: T) {
    provide(key, value);
  }

  function injector(
    ...args: T extends (...args: infer P) => unknown ? P : never[]
  ) {
    const data = inject(key);

    if (!data) {
      throw new Error(
        `We could not find any ${name} injection, make sure to provide it from an ancestor of this component`,
      );
    }

    return getValueFromMaybeFunction(args, data);
  }

  return { provider, injector };
}

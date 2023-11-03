import { Ref, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { injectorFactory } from "src/helpers//injector-factory";

interface HeaderSearchInjectable {
  isHeaderSearchEnabled: Ref<boolean>;
  searchText: Ref<string>;
}

const { provider: _provideHeaderSearch, injector: injectHeaderSearch } =
  injectorFactory<HeaderSearchInjectable>("header-search");

export function provideHeaderSearch() {
  /** Used to show the feature only when required from the pages */
  const isHeaderSearchEnabled = ref(false);
  const searchText = ref("");

  _provideHeaderSearch({ searchText, isHeaderSearchEnabled });

  const route = useRoute();

  // Resets the status each time we change the route
  watch(
    () => route.name,
    () => {
      isHeaderSearchEnabled.value = false;
      searchText.value = "";
    },
    { immediate: true },
  );

  return { searchText, isHeaderSearchEnabled };
}

/**
 * Use this composable to provide the values for the filter and setting on mounted based on the provided options
 *
 * If called with no arguments:
 * If provideHeaderSearch() was not called before, it will use the default values and provide them.
 * This makes the feature disabled by default, so you can add header search as an optional feature to your components.
 *
 * If called with arguments(a non-empty string), it requires provideHeaderSearch() to be called before.
 */
export function useHeaderSearch(initialSearchModel = "") {
  const headerSearchState = injectHeaderSearch();

  // Enables the feature
  headerSearchState.isHeaderSearchEnabled.value = true;

  headerSearchState.searchText.value = initialSearchModel;

  return { ...headerSearchState };
}

import { QSelectOption } from "quasar";
import { Ref, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { injectorFactory } from "src/helpers/injector-factory";

export type HeaderFilterModel<T> =
  | QSelectOption<T>
  | QSelectOption<T>[]
  | undefined;

type HeaderFilterCompareFunction<TOptionValue = unknown> = (
  value1: TOptionValue,
  value2: TOptionValue,
) => boolean;

interface HeaderFilterInjectable<
  TOptionValue = unknown,
  TModelValue = HeaderFilterModel<TOptionValue>,
> {
  filterOptions: Ref<QSelectOption<TOptionValue>[]>;
  selectedFilter: Ref<TModelValue | undefined>;
  isHeaderFiltersEnabled: Ref<boolean>;
  compareFunction: Ref<HeaderFilterCompareFunction<TOptionValue> | undefined>;
}

const { provider: _provideHeaderFilter, injector: injectHeaderFilter } =
  injectorFactory<HeaderFilterInjectable>("header-filters");

export function provideHeaderFilters<
  TOptionValue = unknown,
  TModelValue extends
    HeaderFilterModel<TOptionValue> = HeaderFilterModel<TOptionValue>,
>(): HeaderFilterInjectable<TOptionValue, TModelValue> {
  /** Used to show the feature only when required from the pages */
  const isHeaderFiltersEnabled = ref(false);
  /**
   * Used to define the required options available inside the filter.
   * If empty the feature would be hidden
   */
  // Reason why we need the cast here: https://vuejs.org/guide/essentials/reactivity-fundamentals.html#additional-ref-unwrapping-details
  const filterOptions = ref([]) as Ref<QSelectOption<TOptionValue>[]>;
  const selectedFilter = ref<TModelValue>();

  const compareFunction = ref<HeaderFilterCompareFunction<TOptionValue>>();

  _provideHeaderFilter({
    filterOptions,
    selectedFilter,
    isHeaderFiltersEnabled,
    compareFunction: compareFunction as Ref<
      HeaderFilterCompareFunction | undefined
    >,
  });

  const route = useRoute();

  // Resets the status each time we change the route
  watch(
    () => route.name,
    () => {
      filterOptions.value = [];
      selectedFilter.value = undefined;
    },
    { immediate: true },
  );

  return {
    selectedFilter,
    filterOptions,
    isHeaderFiltersEnabled,
    compareFunction,
  };
}

/**
 * Use this composable to provide the values for the filter and setting on mounted based on the provided options.
 *
 * If called with no arguments, it will return the injected values.
 * If provideHeaderFilters() was not called before, it will use the default values and provide them.
 * This makes the feature disabled by default, so you can add header filters as an optional feature to your components.
 *
 * When calling with arguments, it requires provideHeaderFilters() to be called before.
 * It will enable the feature and set the provided options and initial model.
 */
export function useHeaderFilters<
  TOptionValue = unknown,
  TModelValue extends
    HeaderFilterModel<TOptionValue> = HeaderFilterModel<TOptionValue>,
>(
  options?: Ref<QSelectOption<TOptionValue>[]>,
  initialModel?: TModelValue,
  compareFunction?: HeaderFilterCompareFunction<TOptionValue>,
): HeaderFilterInjectable<TOptionValue, TModelValue> {
  const headerFilterInjectedHelpers =
    injectHeaderFilter() as HeaderFilterInjectable<TOptionValue, TModelValue>;

  if (options === undefined || initialModel === undefined) {
    return { ...headerFilterInjectedHelpers };
  }

  // Enables the feature
  headerFilterInjectedHelpers.isHeaderFiltersEnabled.value = true;

  headerFilterInjectedHelpers.selectedFilter.value = initialModel;
  headerFilterInjectedHelpers.compareFunction.value = compareFunction;

  watch(
    options,
    (newOptions) => {
      headerFilterInjectedHelpers.filterOptions.value = newOptions;
    },
    { immediate: true, deep: true },
  );

  return { ...headerFilterInjectedHelpers };
}

import { Ref, ref, watch } from "vue";
import { RouteLocationRaw, useRoute } from "vue-router";
import { injectorFactory } from "src/helpers/injector-factory";

type HeaderBackButtonRouteLocation = Ref<RouteLocationRaw | undefined>;

const { provider: _provideHeaderBackButton, injector: injectHeaderBackButton } =
  injectorFactory<HeaderBackButtonRouteLocation>("header-back-button");

export function provideHeaderBackButton() {
  /**
   * Used to define the route to point when clicking the back button.
   * I've decided to not use router.back() since the previous route could not exist or could be the wrong one so the page can specify it
   * If undefined disables the feature.
   *
   * !!!!! THIS FEATURE ONLY WORKS FOR MOBILE DEVICES WITH SMALL VIEWPORT !!!!!
   */
  const headerBackButtonRouteLocation = ref<RouteLocationRaw>();

  _provideHeaderBackButton(headerBackButtonRouteLocation);

  const route = useRoute();

  // Resets the status each time we change the route
  watch(
    () => route.name,
    () => {
      headerBackButtonRouteLocation.value = undefined;
    },
    { immediate: true },
  );
  return { headerBackButtonRouteLocation };
}

/** Use this composable to provide the backButtonLocationRoute */
export function useHeaderBackButton(backButtonLocationRoute: RouteLocationRaw) {
  const headerBackButtonRouteLocation = injectHeaderBackButton();

  // Enables the feature
  headerBackButtonRouteLocation.value = backButtonLocationRoute;

  return { headerBackButtonRouteLocation };
}

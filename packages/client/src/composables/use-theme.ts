import { createSharedComposable } from "@vueuse/core";
import { cloneDeep, isEqual, merge, omit } from "lodash-es";
import { LocalStorage, setCssVar } from "quasar";
import { ref, watch } from "vue";
import { useAuthService } from "src/services/auth";
import { useRetailLocationService } from "src/services/retail-location";
import {
  ThemeFragment,
  useUpdateRetailLocationThemeMutation,
} from "src/services/retail-location.graphql";

export type ThemeColor = keyof Omit<ThemeFragment["colors"], "__typename">;

type DeepReadonly<T> = { readonly [Key in keyof T]: DeepReadonly<T[Key]> };
type Theme = ThemeFragment & { logo: string };
const defaultTheme: DeepReadonly<Theme> = Object.freeze({
  // Note: we're hardcoding the colors here instead of getCssVar
  // This is because if user changes theme for the first time and does not
  // save it then in that case we cannot use getCssVar since it will
  // simply give back the newly set variables.
  colors: Object.freeze({
    primary: "#798aa8",
    secondary: "#76e1a7",
    accent: "#c2664d",
  }),
  logo: "/favicon-re.png",
});

const STORAGE_THEME_KEY = "application-theme";
const getFromStorage = () =>
  merge(
    cloneDeep<Theme>(defaultTheme),
    LocalStorage.getItem<ThemeFragment>(STORAGE_THEME_KEY),
  );
const setToStorage = (theme: ThemeFragment) => {
  if (isEqual(theme, getFromStorage())) {
    LocalStorage.remove(STORAGE_THEME_KEY);
    return;
  }

  LocalStorage.set(STORAGE_THEME_KEY, theme);
};

export const useTheme = createSharedComposable(() => {
  // Storage is used as kind of a fallback. See boot/retail-location.ts for the actual theme syncing logic
  const theme = ref<Theme>(getFromStorage());
  const hasPendingChanges = ref(false);

  const { updateRetailLocationTheme } = useUpdateRetailLocationThemeMutation();

  watch(
    () => theme.value.colors,
    ({ primary, secondary, accent }) => {
      setCssVar("primary", primary);
      setCssVar("secondary", secondary);
      setCssVar("accent", accent);
    },
    { immediate: true, deep: true },
  );

  watch(
    theme,
    (theme) => {
      if (!isEqual(theme, getFromStorage())) {
        hasPendingChanges.value = true;
      }
    },
    { deep: true },
  );

  function setDefaults() {
    theme.value = getFromStorage();
    hasPendingChanges.value = false;
  }

  const { selectedLocation } = useRetailLocationService();
  async function saveChanges(logoFile?: File) {
    hasPendingChanges.value = false;
    setToStorage(theme.value);

    await updateRetailLocationTheme({
      input: {
        retailLocationId: selectedLocation.value.id,
        theme: {
          colors: omit(theme.value.colors, ["__typename"]),
        },
      },
    });

    if (!logoFile) {
      return;
    }

    const formData = new FormData();
    formData.append("file", logoFile);

    const { getJwtHeader } = useAuthService();

    const response = await fetch(
      `/location/${selectedLocation.value.id}/logo`,
      {
        method: "PUT",
        body: formData,
        headers: getJwtHeader(),
      },
    );
    if (!response.ok) {
      const data = (await response.json()) as {
        message: string;
        statusCode: number;
      };
      throw new Error(
        `Failed to upload logo: ${data.statusCode} - ${data.message}`,
      );
    }
  }

  return {
    theme,
    defaultTheme,
    hasPendingChanges,
    setDefaults,
    saveChanges,
  };
});

import { createSharedComposable } from "@vueuse/core";
import { cloneDeep, isEqual, omit } from "lodash-es";
import { setCssVar } from "quasar";
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

const getDefaults = () => cloneDeep<Theme>(defaultTheme);

export const useTheme = createSharedComposable(() => {
  // See boot/retail-location.ts for the theme syncing logic
  const theme = ref<Theme>(getDefaults());
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
      if (!isEqual(theme, getDefaults())) {
        hasPendingChanges.value = true;
      }
    },
    { deep: true },
  );

  function setDefaults() {
    theme.value = getDefaults();
    hasPendingChanges.value = false;
  }

  const { selectedLocation } = useRetailLocationService();
  async function saveChanges(logoFile?: File) {
    hasPendingChanges.value = false;

    if (!selectedLocation.value?.id) {
      setDefaults();
      return;
    }

    await updateRetailLocationTheme({
      input: {
        retailLocationId: selectedLocation.value.id,
        theme: {
          resetLogo: theme.value.logo === defaultTheme.logo,
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
    getDefaultThemeCopy: getDefaults,
    hasPendingChanges,
    setDefaults,
    saveChanges,
  };
});

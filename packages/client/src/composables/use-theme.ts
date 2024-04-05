import { cloneDeep, isEqual } from "lodash-es";
import { LocalStorage, setCssVar } from "quasar";
import { ref, watch } from "vue";
import { useUpdateRetailLocationThemeMutation } from "src/services/retail-location.graphql";

export type ThemeColor = "primary" | "secondary" | "accent";

interface Theme {
  colors: Record<ThemeColor, string>;
  logo: string;
}

const STORAGE_THEME_KEY = "application-theme";
const hasPendingChanges = ref(false);
// TODO: change to actual logic
const retailLocationId = "re";
const defaultTheme: Theme = {
  // Note: we're hardcoding the colors here instead of getCssVar
  // This is because if user changes theme for the first time and does not
  // save it then in that case we cannot use getCssVar since it will
  // simply give back the newly set variables.
  colors: {
    primary: "#798aa8",
    secondary: "#76e1a7",
    accent: "#c2664d",
  },
  logo: `/favicon-${retailLocationId}.png`,
};

// Storage is used as kind of a fallback. See boot/retail-location.ts for the actual theme syncing logic
const theme = ref<Theme>(
  LocalStorage.getItem<Theme>(STORAGE_THEME_KEY) ?? cloneDeep(defaultTheme),
);

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
  () => {
    if (!isEqual(theme.value, LocalStorage.getItem<Theme>(STORAGE_THEME_KEY))) {
      hasPendingChanges.value = true;
    }
  },
  { deep: true },
);

function setDefaults() {
  const currentDefaultTheme =
    LocalStorage.getItem<Theme>(STORAGE_THEME_KEY) ?? defaultTheme;
  theme.value = cloneDeep(currentDefaultTheme);
  hasPendingChanges.value = false;
}

export function useTheme() {
  const { updateRetailLocationTheme } = useUpdateRetailLocationThemeMutation();

  async function saveChanges() {
    hasPendingChanges.value = false;
    LocalStorage.set(STORAGE_THEME_KEY, theme.value);
    await updateRetailLocationTheme({
      input: {
        retailLocationId,
        theme: theme.value.colors,
      },
    });
  }

  return {
    theme,
    defaultTheme,
    hasPendingChanges,
    setDefaults,
    saveChanges,
  };
}

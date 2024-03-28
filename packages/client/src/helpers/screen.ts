import { useQuasar } from "quasar";
import { computed } from "vue";

export const enum WidthSize {
  SM,
  MD,
  LG,
}

export const useScreenWidth = (
  smallBreakpoint: number,
  largeBreakpoint = Infinity,
) => {
  const { screen } = useQuasar();
  return computed<WidthSize>(() =>
    screen.width >= largeBreakpoint
      ? WidthSize.LG
      : screen.width >= smallBreakpoint
        ? WidthSize.MD
        : WidthSize.SM,
  );
};

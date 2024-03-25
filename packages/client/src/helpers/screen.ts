import { useQuasar } from "quasar";
import { computed } from "vue";

export const enum WidthSize {
  SM,
  MD,
  LG,
}

export const useScreenWidth = (
  smallBreakpoint: number,
  largeBreakpoint?: number,
) => {
  const { screen } = useQuasar();
  return computed<WidthSize>(() =>
    screen.width >= (largeBreakpoint ?? Infinity)
      ? WidthSize.LG
      : screen.width >= smallBreakpoint
        ? WidthSize.MD
        : WidthSize.SM,
  );
};

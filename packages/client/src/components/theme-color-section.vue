<template>
  <div class="items-center justify-between row">
    <div class="items-start row">
      <div :class="`bg-${name}`" class="circle q-ml-sm q-mt-sm"></div>
      <div class="column q-ml-xl">
        <span class="line-height-75 text-size-16">
          {{ t(`general.${name}`) }}
        </span>
        <span class="text-black-54 text-subtitle">
          {{ theme.colors[name] }}
        </span>
        <span class="text-black-54 text-subtitle">
          {{ rgbToText(hexToRgb(theme.colors[name])) }}
        </span>
      </div>
    </div>

    <q-btn color="black-12" outline @click="openColorPickerDialog(name)">
      <span class="text-black-87">
        {{ t("common.edit") }}
      </span>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { Dialog, colors, colorsRgba } from "quasar";
import { useI18n } from "vue-i18n";
import ColorPickerDialog from "src/components/color-picker-dialog.vue";
import { ThemeColor, useTheme } from "src/composables/use-theme";

const { hexToRgb } = colors;

defineProps<{
  name: ThemeColor;
}>();

const { t } = useI18n();

const { theme } = useTheme();

const rgbToText = ({ r, g, b }: colorsRgba) => `R${r} G${g} B${b}`;

function openColorPickerDialog(colorType: ThemeColor) {
  Dialog.create({
    component: ColorPickerDialog,
    componentProps: {
      color: theme.value.colors[colorType],
    },
  }).onOk((newColor: string) => {
    theme.value.colors[colorType] = newColor;
  });
}
</script>

<style lang="scss" scoped>
.circle {
  border-radius: 50px;
  height: 24px;
  width: 24px;
}
</style>

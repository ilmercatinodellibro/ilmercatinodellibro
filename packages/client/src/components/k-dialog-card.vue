<template>
  <q-card :class="`size--${size}`" class="mobile-responsive-dialog">
    <q-card-section class="bg-white text-h6 text-primary">
      <slot name="title">
        {{ title }}
      </slot>
    </q-card-section>

    <q-separator />

    <slot />

    <q-separator />

    <q-card-actions v-if="!noActions" align="right">
      <slot name="card-actions">
        <q-btn
          :label="cancelLabel ?? t('common.cancel')"
          flat
          @click="emit('cancel')"
        />
        <q-btn
          v-if="showSaveButton"
          flat
          :label="saveLabel ?? t('common.confirm')"
          @click="emit('save')"
        />
      </slot>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { QCard } from "quasar";
import { useI18n } from "vue-i18n";
import { CommonDialogProps } from "./dialog-models";

const { t } = useI18n();

withDefaults(
  defineProps<
    CommonDialogProps & {
      saveLabel?: string;
      showSaveButton?: boolean;
    }
  >(),
  {
    title: undefined,
    size: "md",
    noActions: false,
    saveLabel: undefined,
    showSaveButton: false,
  },
);

const emit = defineEmits<{
  save: [];
  cancel: [];
}>();
</script>

<style lang="scss" scoped>
$dialog-margin: 24px;
$complex-dialog-max-height: 800px;
$complex-dialog-breakpoint: $complex-dialog-max-height + $dialog-margin * 2;
$dialog-fullscreen-max-height: calc(100vh - #{$dialog-margin} * 2);

%fullscreen {
  // This max-height is set so that the dialog doesn't extend below
  // the bottom edge of the screen on certain resolutions
  max-height: calc(100vh - 2 * #{$dialog-margin});
  max-width: 100vw;
}

.size {
  &--sm {
    max-width: 360px;
    max-height: $dialog-fullscreen-max-height;
    min-width: 360px;

    @media screen and (height >= $complex-dialog-breakpoint) {
      max-height: $complex-dialog-max-height;
    }
  }

  &--md {
    @extend %fullscreen;

    @media screen and (min-width: $breakpoint-md-min) {
      max-height: $dialog-fullscreen-max-height;
      max-width: 800px;
      min-width: 800px;

      @media screen and (height >= $complex-dialog-breakpoint) {
        max-height: $complex-dialog-max-height;
      }
    }
  }

  &--lg {
    @extend %fullscreen;

    @media screen and (min-width: $breakpoint-md-min) {
      max-height: $dialog-fullscreen-max-height;
      max-width: 1500px;
      min-width: 1000px;

      @media screen and (height >= $complex-dialog-breakpoint) {
        max-height: $complex-dialog-max-height;
      }
    }

    @media screen and (min-width: $breakpoint-lg-min) {
      min-width: 1500px;
    }
  }

  &--xl {
    @extend %fullscreen;

    @media screen and (min-width: $breakpoint-md-min) {
      max-height: $dialog-fullscreen-max-height;
      max-width: 1900px;
      min-width: 1200px;

      @media screen and (height >= $complex-dialog-breakpoint) {
        max-height: $complex-dialog-max-height;
      }
    }

    @media screen and (min-width: $breakpoint-xl-min) {
      min-width: 1900px;
    }
  }

  &--fullscreen {
    @extend %fullscreen;
  }
}
</style>

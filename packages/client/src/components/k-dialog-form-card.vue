<template>
  <k-dialog-card :title="title" :size="size" no-actions>
    <template #title>
      <slot name="title" />
    </template>
    <!-- We provide an automatic scroll behavior to keep title and actions not scrollable -->
    <div v-if="!delegateScroll" class="column scrollable-content-container">
      <q-form
        :id="uniqueFormId"
        :greedy="greedy"
        @submit="emit('submit')"
        @validation-error="emit('validation-error', $event)"
      >
        <slot />
      </q-form>
    </div>
    <!--
      It's possible to manage scroll autonomously by using delegateScroll prop and
      adding "column scrollable-content-container" somewhere within the slot content
      Keep in mind that you should not break the flex and overflow chain if you want to leverage this:
      every child from the top dialog to the scrollable container should be a flex item with overflow auto ("scroll" class)
      with no-wrap
      Adding "column no-wrap scrollable-content-container" to the scrollable container should be enough
      TODO: this way of delegating scroll is pretty terrible, we should find a better DX to manage this
    -->
    <q-form
      v-else
      :id="uniqueFormId"
      :greedy="greedy"
      class="column no-wrap scroll"
      @submit="emit('submit')"
    >
      <slot />
    </q-form>

    <q-separator v-if="!noActions" />

    <q-card-actions v-if="!noActions" align="right">
      <!-- Here we want to pass to the slot props the form uuid in order to be able to use the a custom submit button and still be able to connect it to the form -->
      <slot name="card-actions" :unique-form-id="uniqueFormId">
        <q-btn
          :label="cancelLabel ?? t('common.cancel')"
          flat
          data-cy="cancel-button"
          @click="emit('cancel')"
        />
        <q-btn
          :form="uniqueFormId"
          :label="submitLabel ?? t('common.confirm')"
          flat
          type="submit"
          data-cy="submit-button"
        />
      </slot>
    </q-card-actions>
  </k-dialog-card>
</template>

<script setup lang="ts">
import { uid } from "quasar";
import { Component } from "vue";
import { useI18n } from "vue-i18n";
import { CommonDialogProps } from "./dialog-models";
import KDialogCard from "./k-dialog-card.vue";

const { t } = useI18n();

// Avoids collisions when there's more than one active component instance at the same time
const uniqueFormId = `dialog-form-${uid()}`;

withDefaults(
  defineProps<
    CommonDialogProps & {
      submitLabel?: string;
      greedy?: boolean;
      delegateScroll?: boolean;
    }
  >(),
  {
    size: "md",
    greedy: false,
    submitLabel: undefined,
    delegateScroll: false,
  },
);

const emit = defineEmits<{
  submit: [];
  cancel: [];
  "validation-error": [Component];
}>();
</script>

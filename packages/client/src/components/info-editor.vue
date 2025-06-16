<template>
  <!-- TODO: focus the link bar text when pressing the link button -->
  <q-editor
    ref="editorRef"
    v-model="editorModel"
    :toolbar
    class="column info-editor no-wrap"
    toolbar-bg="white"
    toolbar-toggle-color="accent"
  >
    <template #color>
      <q-btn class="min-height-0" dense flat>
        <q-icon :name="mdiFormatColorText" :size="isMobile ? '18px' : '24px'" />
        <q-icon
          :name="mdiColorHelper"
          :size="isMobile ? '18px' : '24px'"
          class="absolute"
        />

        <q-menu auto-close class="font-weight-600 q-pa-sm row">
          <q-item-section>
            <q-item-label>
              {{ t("retailLocation.foregroundColor") }}
            </q-item-label>
            <q-color v-model="textColor" @change="updateTextColor()" />
          </q-item-section>

          <q-item-section>
            <q-item-label>
              {{ t("retailLocation.highlightColor") }}
            </q-item-label>
            <q-color v-model="highlightColor" @change="updateTextHighlight()" />
          </q-item-section>
        </q-menu>
      </q-btn>
    </template>
    <template #toolbar-actions>
      <slot name="toolbar-actions" />
    </template>
  </q-editor>
</template>

<script setup lang="ts">
import { mdiColorHelper, mdiFormatColorText } from "@quasar/extras/mdi-v7";
import { QEditor, useQuasar } from "quasar";
import { ref, Ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";

defineEmits<{ "update:modelValue": [newValue: string] }>();

const { t } = useI18n();

const { isMobile } = useLateralDrawer();

const editorModel = defineModel<string>({ required: true });

onMounted(() => {
  // Forces usage of inline CSS style for text color and background color
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  document.execCommand("styleWithCSS", false, true);
});

const editorRef = ref() as Ref<QEditor>;
const textColor = ref("#000");
const highlightColor = ref("#edf2fa");

const q = useQuasar();
const toolbar = [
  ["left", "center", "right", "justify"],
  ["bold", "italic", "underline", "strike"],
  [
    {
      fixedIcon: true,
      fixedLabel: true,
      icon: q.iconSet.editor.fontSize,
      list: "no-icons",
      options: [
        "size-1",
        "size-2",
        "size-3",
        "size-4",
        "size-5",
        "size-6",
        "size-7",
      ],
    },
    "color",
  ],
  ["hr", "link"],
  ["unordered", "ordered", "outdent", "indent"],
  ["undo", "redo"],
  ["toolbar-actions"],
];

function updateTextColor() {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  document.execCommand("foreColor", false, textColor.value);
}

function updateTextHighlight() {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  document.execCommand("backColor", false, highlightColor.value);
}
</script>

<style scoped lang="scss">
.info-editor {
  background-color: inherit;

  // Override default QEditor toolbar buttons dimensions and spacing
  :deep(.q-icon) {
    height: 18px;
    width: 18px;

    @media screen and (min-width: $breakpoint-sm) {
      height: 24px;
      width: 24px;
    }
  }

  // Hides the last toolbar column vertical separator to match the design
  :deep(.q-editor__toolbar > :last-child)::before {
    display: none;
  }
}

:deep(.q-btn-dropdown__arrow) {
  margin: 0;
}
</style>

<template>
  <q-editor
    ref="editorRef"
    v-model="editorModel"
    :toolbar
    class="column info-editor no-wrap"
    toolbar-bg="white"
  >
    <template #color>
      <q-btn class="min-height-0" dense flat>
        <q-icon :name="mdiFormatColorText" :size="isMobile ? '18px' : '24px'" />
        <q-icon
          :name="mdiColorHelper"
          :size="isMobile ? '18px' : '24px'"
          class="absolute"
        />

        <q-menu class="font-weight-600 q-pa-sm row">
          <q-item-section>
            <q-item-label>
              {{ t("retailLocation.foregroundColor") }}
            </q-item-label>
            <q-color
              v-model="textColorModel"
              @change="changeTextColor('fore')"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label>
              {{ t("retailLocation.backgroundColor") }}
            </q-item-label>
            <q-color v-model="bgColorModel" @change="changeTextColor('back')" />
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
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";

defineEmits<{ "update:modelValue": [newValue: string] }>();

const { t } = useI18n();

const { isMobile } = useLateralDrawer();

const editorModel = defineModel<string>({ required: true });
const editorRef = ref<QEditor>();
const bgColorModel = ref("#edf2fa");
const textColorModel = ref("#000");

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

function changeTextColor(target: "back" | "fore") {
  editorRef.value?.runCmd(
    `${target}Color`,
    target === "back" ? bgColorModel.value : textColorModel.value,
  );
}
</script>

<style scoped lang="scss">
.info-editor {
  background-color: inherit;

  // Override default QEditor toolbar buttons dimensions and spacing
  :deep(.q-icon) {
    height: 18px;
    width: 18px;

    @media screen and (width >= $breakpoint-sm) {
      height: 24px;
      width: 24px;
    }
  }

  :deep(.q-editor__toolbar > :last-child)::before {
    display: none;
  }
}

:deep(.q-btn-dropdown__arrow) {
  margin: 0;
}
</style>

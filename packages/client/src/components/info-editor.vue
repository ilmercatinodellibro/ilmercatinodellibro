<template>
  <q-editor
    ref="editorRef"
    v-model="editorModel"
    :toolbar="[
      !isMobile
        ? ['left', 'center', 'right', 'justify']
        : [
            {
              icon: $q.iconSet.editor.align,
              fixedLabel: true,
              list: 'only-icons',
              options: ['left', 'center', 'right', 'justify'],
            },
          ],
      ['bold', 'italic', 'underline', 'strike'],
      [
        {
          fixedIcon: true,
          fixedLabel: true,
          icon: $q.iconSet.editor.fontSize,
          list: 'no-icons',
          options: [
            'size-1',
            'size-2',
            'size-3',
            'size-4',
            'size-5',
            'size-6',
            'size-7',
          ],
        },
        'color',
      ],
      ['hr', 'link'],
      ['unordered', 'ordered', 'outdent', 'indent'],
      ['save', 'undo', 'redo'],
    ]"
    class="column info-editor no-wrap"
    toolbar-bg="white"
  >
    <template #color>
      <q-btn flat>
        <q-icon :name="mdiFormatColorText" />
        <q-icon :name="mdiColorHelper" class="absolute" />

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
    <template v-if="!isMobile" #save>
      <q-btn
        :label="t('general.saveChanges')"
        class="save-btn"
        color="accent"
        @click="emit('save', editorModel)"
      />
    </template>
  </q-editor>
</template>

<script setup lang="ts">
import { mdiColorHelper, mdiFormatColorText } from "@quasar/extras/mdi-v7";
import { QEditor } from "quasar";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useLateralDrawer } from "src/composables/use-lateral-drawer";
import { useRetailLocationService } from "src/services/retail-location";

const props = defineProps<{
  infoType: "faqContent" | "joinUsContent" | "whoAreWeContent";
}>();

const emit = defineEmits<{ save: [text: string] }>();

const { t, locale } = useI18n();

const { isMobile } = useLateralDrawer();

const { selectedLocation } = useRetailLocationService();

const editorModel = ref(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  selectedLocation.value.infoPagesContent[locale.value][props.infoType],
);
const editorRef = ref<QEditor>();
const bgColorModel = ref("#edf2fa");
const textColorModel = ref("#000");

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
}

// Override default QEditor toolbar buttons dimensions and spacing
:deep(.q-icon) {
  font-size: 24px;

  @media screen and (max-width: $breakpoint-sm) {
    font-size: 18px;
  }
}

:deep(.q-btn-item):not(.save-btn) {
  min-height: 24px;
  min-width: 24px;
  margin: 12px 8px;
  padding: 0;
}

.save-btn {
  float: right;
}

:deep(.q-btn-dropdown__arrow) {
  margin: 0;
}
</style>

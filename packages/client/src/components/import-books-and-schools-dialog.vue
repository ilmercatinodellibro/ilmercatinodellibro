<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <k-dialog-card
      :title="t('general.settings.importBooksAndSchools.title')"
      class="width-700"
      no-actions
      size="fullscreen"
    >
      <q-card-section
        class="column gap-8 no-wrap q-pa-lg scroll-y text-black-54 text-size-16"
      >
        <span>
          {{
            t("general.settings.importBooksAndSchools.pasteUrlBooksDescription")
          }}

          <a
            :href="BOOK_LIST_LINK"
            class="text-primary wrap-break-word"
            target="_blank"
          >
            {{ BOOK_LIST_LINK }}
          </a>
        </span>

        <q-input
          v-model="bookListUrlModel"
          :label="t('general.settings.importBooksAndSchools.booksUrlLabel')"
          :rules="[requiredRule, urlRule]"
          clearable
          outlined
        />

        <q-btn
          :icon="mdiDownload"
          :label="t('general.settings.importBooksAndSchools.importBooksButton')"
          color="accent"
        />

        <span class="q-mt-md">
          {{
            t(
              "general.settings.importBooksAndSchools.pasteUrlSchoolsDescription",
            )
          }}

          <a
            :href="SCHOOL_LIST_LINK"
            class="text-primary wrap-break-word"
            target="_blank"
          >
            {{ SCHOOL_LIST_LINK }}
          </a>
        </span>

        <span class="text-negative">
          {{ t("general.settings.importBooksAndSchools.schoolsImportWarning") }}
        </span>

        <q-input
          v-model="publicSchoolListUrlModel"
          :label="t('general.settings.importBooksAndSchools.schoolsUrlLabel')"
          :rules="[requiredRule, urlRule]"
          clearable
          outlined
        />

        <q-input
          v-model="privateSchoolListUrlModel"
          :label="
            t('general.settings.importBooksAndSchools.schoolsPrivateUrlLabel')
          "
          :rules="[requiredRule, urlRule]"
          clearable
          outlined
        />

        <q-btn
          :icon="mdiDownload"
          :label="
            t('general.settings.importBooksAndSchools.importSchoolsButton')
          "
          color="accent"
        />
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn :label="t('actions.close')" flat @click="onDialogCancel" />
      </q-card-actions>
    </k-dialog-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiDownload } from "@quasar/extras/mdi-v7";
import { useDialogPluginComponent, type ValidationRule } from "quasar";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import KDialogCard from "src/components/k-dialog-card.vue";
import { requiredRule } from "src/helpers/rules";

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();

const { t } = useI18n();

const BOOK_LIST_LINK =
  "https://dati.istruzione.it/opendata/opendata/catalogo/elements1/?area=Adozioni%20libri%20di%20testo";
const SCHOOL_LIST_LINK =
  "https://dati.istruzione.it/opendata/opendata/catalogo/elements1/?area=Adozioni%20libri%20di%20testo";

const bookListUrlModel = ref<string>();
const publicSchoolListUrlModel = ref<string>();
const privateSchoolListUrlModel = ref<string>();

const urlRule: ValidationRule<string | null | undefined> = (value) => {
  if (!value) {
    return t("validators.nonValidAddress");
  }

  try {
    new URL(value);
    return true;
  } catch {
    return t("validators.nonValidAddress");
  }
};
</script>

<style scoped lang="scss">
.wrap-break-word {
  word-wrap: break-word;
}
</style>

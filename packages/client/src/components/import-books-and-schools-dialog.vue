<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <k-dialog-card
      :title="t('general.settings.importBooksAndSchools.title')"
      no-actions
    >
      <q-card-section
        class="column full-width gap-24 max-width-700 no-wrap q-pa-lg scroll-y text-black-54 text-size-16"
      >
        <q-form class="column gap-8 no-wrap" @submit="handleImportBooks">
          <span>
            {{
              t(
                "general.settings.importBooksAndSchools.pasteUrlBooksDescription",
              )
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
            v-model.trim="bookListUrlModel"
            :disable="importBooksLoading"
            :label="t('general.settings.importBooksAndSchools.booksUrlLabel')"
            :rules="[requiredRule, makeValidateUrlRule(BOOKS_URL_PATTERN)]"
            clearable
            lazy-rules
            outlined
          />

          <q-btn
            :icon="mdiDownload"
            :label="
              t('general.settings.importBooksAndSchools.importBooksButton')
            "
            :disabled="!isBookUrlFilled"
            :loading="importBooksLoading"
            color="accent"
            type="submit"
          />
        </q-form>

        <q-form class="column gap-8 no-wrap" @submit="handleImportSchools">
          <span>
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
            {{
              t("general.settings.importBooksAndSchools.schoolsImportWarning")
            }}
          </span>

          <q-input
            v-model.trim="publicSchoolListUrlModel"
            :disable="importSchoolsLoading || !areBooksImported"
            :label="t('general.settings.importBooksAndSchools.schoolsUrlLabel')"
            :rules="[
              requiredRule,
              makeValidateUrlRule(PUBLIC_SCHOOLS_URL_PATTERN),
            ]"
            clearable
            outlined
            lazy-rules
          />

          <q-input
            v-model.trim="privateSchoolListUrlModel"
            :disable="importSchoolsLoading || !areBooksImported"
            :label="
              t('general.settings.importBooksAndSchools.schoolsPrivateUrlLabel')
            "
            :rules="[
              requiredRule,
              makeValidateUrlRule(PRIVATE_SCHOOLS_URL_PATTERN),
            ]"
            clearable
            outlined
            lazy-rules
          />

          <q-btn
            :icon="mdiDownload"
            :label="
              t('general.settings.importBooksAndSchools.importSchoolsButton')
            "
            :disabled="!areSchoolUrlsFilled || !areBooksImported"
            :loading="importSchoolsLoading"
            class="full-width"
            color="accent"
            type="submit"
          />
        </q-form>
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
import { useDialogPluginComponent, Dialog } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import KDialogCard from "src/components/k-dialog-card.vue";
import { requiredRule } from "src/helpers/rules";
import {
  useImportBooksMutation,
  useImportSchoolsMutation,
} from "src/services/book.graphql";

defineEmits(useDialogPluginComponent.emitsObject);

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();
const { t } = useI18n();

const BOOK_LIST_LINK =
  "https://dati.istruzione.it/opendata/opendata/catalogo/elements1/?area=Adozioni%20libri%20di%20testo";
const SCHOOL_LIST_LINK =
  "https://dati.istruzione.it/opendata/opendata/catalogo/elements1/?area=Scuole";

const bookListUrlModel = ref<string>();
const publicSchoolListUrlModel = ref<string>();
const privateSchoolListUrlModel = ref<string>();

const isBookUrlFilled = computed(() => !!bookListUrlModel.value);
const areSchoolUrlsFilled = computed(
  () => !!publicSchoolListUrlModel.value && !!privateSchoolListUrlModel.value,
);

const { importBooks, loading: importBooksLoading } = useImportBooksMutation();
const { importSchools, loading: importSchoolsLoading } =
  useImportSchoolsMutation();

const BOOKS_URL_PATTERN =
  /^https:\/\/dati\.istruzione\.it\/opendata\/opendata\/catalogo\/elements1\/ALTEMILIAROMAGNA\w*\.csv$/;
const PUBLIC_SCHOOLS_URL_PATTERN =
  /^https:\/\/dati\.istruzione\.it\/opendata\/opendata\/catalogo\/elements1\/SCUANAGRAFESTAT\w*\.csv$/;
const PRIVATE_SCHOOLS_URL_PATTERN =
  /^https:\/\/dati\.istruzione\.it\/opendata\/opendata\/catalogo\/elements1\/SCUANAGRAFEPAR\w*\.csv$/;

function makeValidateUrlRule(pattern: RegExp) {
  return (value: string | null | undefined) => {
    if (!value) {
      return true;
    }

    try {
      new URL(value);
    } catch {
      return t("validators.nonValidAddress");
    }

    if (!pattern.test(value)) {
      return t("validators.nonValidUrlFormat");
    }

    return true;
  };
}

const areBooksImported = ref(false);
async function handleImportBooks() {
  if (!bookListUrlModel.value) {
    return;
  }

  try {
    const { data } = await importBooks({
      input: {
        booksUrl: bookListUrlModel.value,
      },
    });

    areBooksImported.value = true;
    Dialog.create({
      title: t("general.settings.importBooksAndSchools.importSuccess"),
      message: t(
        "general.settings.importBooksAndSchools.importBooksSuccessMessage",
        {
          currentDbBooksCount: data.currentDbBooksCount,
        },
      ),
    });
  } catch {
    Dialog.create({
      title: t("general.settings.importBooksAndSchools.importError"),
      message: t(
        "general.settings.importBooksAndSchools.importBooksErrorMessage",
      ),
    });
  }
}

async function handleImportSchools() {
  if (
    !publicSchoolListUrlModel.value ||
    !privateSchoolListUrlModel.value ||
    !areBooksImported.value
  ) {
    return;
  }

  try {
    const { data } = await importSchools({
      input: {
        publicSchoolsUrl: publicSchoolListUrlModel.value,
        privateSchoolsUrl: privateSchoolListUrlModel.value,
      },
    });

    Dialog.create({
      title: t("general.settings.importBooksAndSchools.importSuccess"),
      message: t(
        "general.settings.importBooksAndSchools.importSchoolsSuccessMessage",
        {
          schoolCount: data.schoolCount,
          coursesCount: data.coursesCount,
          booksOnCoursesCount: data.booksOnCoursesCount,
        },
      ),
    });
  } catch {
    Dialog.create({
      title: t("general.settings.importBooksAndSchools.importError"),
      message: t(
        "general.settings.importBooksAndSchools.importSchoolsErrorMessage",
      ),
    });
  }
}
</script>

<style scoped lang="scss">
.wrap-break-word {
  text-wrap: wrap;
  word-wrap: break-word;
}
</style>

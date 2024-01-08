<template>
  <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
    <q-card class="dialog-wrapper">
      <q-card-section>
        <div class="text-h6 text-primary">
          {{
            $t("manageUsers.inStockDialog.title", [
              userData.firstname,
              userData.lastname,
            ])
          }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <q-tabs v-model="tab" inline-label active-color="secondary">
          <q-tab
            name="in-retrieval"
            :label="$t('manageUsers.inRetrieval')"
            class="col"
          />
          <q-tab
            name="retrieved"
            :label="$t('manageUsers.retrieved')"
            class="col"
            inline
          >
            <template #default>
              <q-icon name="mdi-information-outline" class="q-ml-sm" size="sm">
                <q-tooltip>
                  {{ $t("manageUsers.inStockDialog.retrievableTooltip") }}
                </q-tooltip>
              </q-icon>
            </template>
          </q-tab>
        </q-tabs>

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="in-retrieval">
            <q-card-section class="items-center justify-between q-pa-none row">
              <div class="col items-center no-wrap q-gutter-md row">
                <q-input
                  v-model="searchQuery"
                  type="search"
                  class="col col-shrink search-bar"
                  outlined
                  :placeholder="$t('manageUsers.inStockDialog.searchHint')"
                />
                <q-btn
                  class="col col-shrink"
                  color="secondary"
                  icon="mdi-plus"
                  :label="$t('book.addBookDialog')"
                />
              </div>
              <q-btn
                class="col col-shrink"
                color="primary"
                :label="$t('manageUsers.inStockDialog.retrieveBtn')"
              />
            </q-card-section>

            <dialog-table :columns="inRetrievalColumns">
              <template #body-cell-utility="{ value }">
                <q-td>
                  <div class="cell-wrapper">
                    <utility-chip :value="value" />
                  </div>
                </q-td>
              </template>
            </dialog-table>
          </q-tab-panel>

          <q-tab-panel name="retrieved">
            <span class="items-center justify-between row">
              <q-input
                v-model="searchQuery"
                type="search"
                outlined
                class="col col-shrink search-bar"
                :placeholder="$t('manageUsers.inStockDialog.searchHint')"
              />
              <q-item class="col col-shrink items-center row">
                <q-btn
                  color="secondary"
                  icon="mdi-plus"
                  :label="$t('book.addBookDialog')"
                />
              </q-item>
            </span>
            <dialog-table :columns="retrievedColumns">
              <template #body-cell-utility="{ value }">
                <q-td>
                  <div class="cell-wrapper">
                    <utility-chip :value="value" />
                  </div>
                </q-td>
              </template>
            </dialog-table>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right">
        <q-btn flat :label="$t('common.close')" @click="onDialogOK(userData)" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { UserFragment } from "src/services/user.graphql";
import UtilityChip from "../utility-chip.vue";
import DialogTable from "./dialog-table.vue";

const { t } = useI18n();

const tab = ref("in-retrieval");
const searchQuery = ref("");

const inRetrievalColumns = computed(() => [
  {
    label: t("book.fields.isbn"),
    field: "isbn",
    name: "isbn",
  },
  {
    label: t("book.fields.author"),
    field: "author",
    name: "author",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("book.fields.subject"),
    field: "subject",
    name: "subject",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("book.fields.status"),
    field: "status",
    name: "status",
  },
  {
    label: t("book.conditions"),
    field: "conditions",
    name: "conditions",
  },
  {
    label: t("book.fields.title"),
    field: "title",
    name: "title",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("book.fields.publisher"),
    field: "publisher",
    name: "publisher",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("book.fields.price"),
    field: "price",
    name: "price",
  },
  {
    label: t("book.fields.utility"),
    field: "utility",
    name: "utility",
  },
  {
    label: t("manageUsers.actions"),
    field: "",
    name: "actions",
  },
]);
const retrievedColumns = computed(() => [
  {
    label: t("book.fields.isbn"),
    field: "isbn",
    name: "isbn",
  },
  {
    label: t("book.code"),
    field: "code",
    name: "code",
  },
  {
    label: t("book.originalCode"),
    field: "originalCode",
    name: "originalCode",
  },
  {
    label: t("book.fields.author"),
    field: "author",
    name: "author",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("book.fields.subject"),
    field: "subject",
    name: "subject",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("book.fields.status"),
    field: "status",
    name: "status",
  },
  {
    label: t("book.conditions"),
    field: "conditions",
    name: "conditions",
  },
  {
    label: t("book.fields.title"),
    field: "title",
    name: "title",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("book.fields.publisher"),
    field: "publisher",
    name: "publisher",
    headerClasses: "ellipsis",
    classes: "ellipsis",
  },
  {
    label: t("book.fields.price"),
    field: "price",
    name: "price",
  },
  {
    label: t("book.fields.utility"),
    field: "utility",
    name: "utility",
  },
]);

defineProps<{
  userData: UserFragment;
}>();
0;

const { dialogRef, onDialogOK, onDialogHide } = useDialogPluginComponent();

defineEmits(useDialogPluginComponent.emitsObject);
</script>

<style scoped lang="scss">
.search-bar {
  width: 420px;
}

.dialog-wrapper {
  max-width: 100% !important;
}

:deep(.cell-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
</style>

<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="dialog-card">
      <q-card-section class="q-px-lg q-py-md">
        <div class="tex-primary text-h6">
          {{ $t("book.addBookDialog") }}
        </div>
      </q-card-section>
      <q-separator />
      <q-form @submit="onDialogOK">
        <q-card-section class="q-col-gutter-sm q-pa-lg">
          <div v-for="(title, index) in titles" :key="title">
            <q-input
              v-if="title !== $t('book.fields.subject')"
              v-model="newBook[index]"
              :label="title"
              :rules="[(val) => !!val || $t('book.requiredField')]"
              :type="title === $t('book.fields.title') ? 'textarea' : 'text'"
              lazy-rules
              outlined
            />
            <q-select
              v-else
              v-model="newBook[titles.indexOf($t('book.fields.subject'))]"
              :options="subjects"
              :label="$t('book.fields.subject')"
              :rules="[(val) => !!val || $t('book.requiredField')]"
              lazy-rules
              outlined
            />
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn :label="$t('book.cancel')" flat @click="onDialogCancel" />
          <q-btn :label="$t('book.add')" type="submit" flat />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from "quasar";
import { ref } from "vue";

const { dialogRef, onDialogOK, onDialogCancel, onDialogHide } =
  useDialogPluginComponent();

defineEmits({
  ...useDialogPluginComponent.emitsObject,
});

defineProps<{
  titles: string[];
  subjects: string[];
}>();

const newBook = ref<string[]>([]);
</script>

<style scoped lang="scss">
.dialog-card {
  width: 360px;
}
</style>

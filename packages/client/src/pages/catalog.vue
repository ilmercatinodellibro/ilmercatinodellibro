<template>
  <div>
    <q-btn @click="loadBooks()">{{ t("book.loadBooksButton") }}</q-btn>

    <span v-if="bookLoading">{{ t("book.loading") }}</span>
    <div v-else>
      <div class="row">
        <q-input v-model="filter" debounce="400" type="text" />
      </div>

      <div v-if="!books.length">{{ t("book.noResult") }}</div>
      <template v-else>
        <div v-for="book in books" :key="book.id">
          {{ book.isbnCode + " " + book.title }}
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useBookService } from "src/services/book";
const { t } = useI18n();

const currentPage = ref(0);
const numnberOfRows = ref(50);
const filter = ref(undefined);

const {
  books,
  loading: bookLoading,
  loadBooksMutation,
} = useBookService(currentPage, numnberOfRows, filter);

async function loadBooks() {
  await loadBooksMutation.loadBooksIntoDatabase();
}
</script>

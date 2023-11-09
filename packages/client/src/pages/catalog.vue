<template>
  <div>
    <q-btn @click="loadBooks()">{{ t("book.loadBooksButton") }}</q-btn>

    <span v-if="bookLoading">{{ t("book.loading") }}</span>
    <div v-else>
      <div v-if="!books.length">{{ t("book.noResult") }}</div>
      <div v-for="book in books" :key="book.id">
        {{ book.isbnCode }}
      </div>
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

const {
  books,
  loading: bookLoading,
  loadBooksMutation,
} = useBookService(currentPage, numnberOfRows);

async function loadBooks() {
  await loadBooksMutation.loadBooksIntoDatabase();
}
</script>

<template>
  <q-page
    class="column items-center justify-center"
    :class="{ 'q-pa-md': $q.screen.gt.xs }"
  >
    <div>
      <span v-if="bookLoading">{{ t("book.loading") }}</span>
      <div v-else>
        <div v-if="!books.length">{{ t("book.noResult") }}</div>
        <div v-for="book in books" :key="book.id">
          {{ book.isbnCode }}
        </div>
      </div>
    </div>
    <!-- TODO: Consider an error overlay or a Notify. Consider allowing to retry fetching. -->
    <div v-if="error" class="col flex flex-center full-width text-size-20">
      {{ t("common.error") }}
    </div>

    <events-list
      v-else-if="$q.screen.lt.sm"
      class="col full-width"
      :notifications="notifications"
      :loading="loading"
    />
    <events-table
      v-else
      class="col full-width"
      :notifications="notifications"
      :loading="loading"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import EventsList from "src/components/events/events-list.vue";
import EventsTable from "src/components/events/events-table.vue";
import { useBookService } from "src/services/book";
import { useNotificationService } from "src/services/notification";

const { t } = useI18n();

const { notifications, loading, error } = useNotificationService();
const currentPage = ref(0);
const numnberOfRows = ref(50);

const { books, loading: bookLoading } = useBookService(
  currentPage,
  numnberOfRows,
);
</script>

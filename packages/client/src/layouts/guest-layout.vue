<template>
  <q-layout view="lHh Lpr lFf">
    <header-bar />

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import headerBar from "src/components/header-bar.vue";

export default defineComponent({
  name: "GuestLayout",
  components: {
    headerBar,
  },
});
</script>

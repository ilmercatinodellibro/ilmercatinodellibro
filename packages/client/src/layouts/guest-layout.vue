<template>
  <q-layout view="lHh Lpr lFf">
    <!-- TODO: Implement "go back to login" button -->
    <!-- TODO: Implement location info tabs -->
    <header-bar />

    <q-page-container class="bg-grey-1">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import HeaderBar from "src/components/header-bar.vue";
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <header-bar />

    <q-page-container class="layout-background">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import HeaderBar from "src/components/header-bar.vue";
</script>

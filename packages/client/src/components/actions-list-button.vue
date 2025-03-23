<template>
  <q-btn :icon="mdiDotsVertical" class="fit" color="primary" flat>
    <q-menu>
      <q-list>
        <slot />
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { mdiDotsVertical } from "@quasar/extras/mdi-v7";
</script>

<template>
  <q-btn :icon="mdiDotsVertical" class="full-height" color="primary" flat>
    <q-menu>
      <q-list>
        <slot>
          <q-item
            v-for="({ label, ...itemProps }, key) in menuItems"
            :key
            v-bind="itemProps"
            v-close-popup="!itemProps.disable"
            clickable
          >
            <q-item-section>
              <q-item-label>
                {{ label }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </slot>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { mdiDotsVertical } from "@quasar/extras/mdi-v7";
import { QItemProps } from "quasar";

defineProps<{
  menuItems?: (Pick<QItemProps, "onClick" | "disable"> & { label: string })[];
}>();
</script>

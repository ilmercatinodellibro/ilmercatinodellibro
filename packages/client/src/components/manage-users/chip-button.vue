<template>
  <!--
    We can't use q-dropdown-btn because the menu icon is not shiftable
    to the left so we have to use a q-btn with a q-menu inside instead
  -->
  <q-btn
    :color="color"
    :icon="showDropdown ? (menu ? mdiMenuUp : mdiMenuDown) : icon"
    :label="label"
    class="min-height-0 q-chip--dense q-chip--square"
    dense
    no-wrap
  >
    <template v-for="(_, slotName) in btnSlots" #[slotName]>
      <q-menu
        v-if="showDropdown && slotName === 'default'"
        :key="slotName"
        v-model="menu"
      >
        <q-list> <slot /> </q-list>
      </q-menu>

      <slot v-else :name="slotName" />
    </template>
  </q-btn>
</template>

<script setup lang="ts">
import { mdiMenuDown, mdiMenuUp } from "@quasar/extras/mdi-v7";
import { QBtnProps, QBtnSlots } from "quasar";
import { ref } from "vue";

defineProps<
  {
    showDropdown?: boolean;
  } & Pick<QBtnProps, "color" | "label" | "icon">
>();

const menu = ref(false);

const btnSlots = defineSlots<QBtnSlots>();
</script>

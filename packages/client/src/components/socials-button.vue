<template>
  <a :href="link">
    <q-btn outline no-caps color="primary" class="socials-button">
      <span class="button-container">
        <q-icon
          class="button-icon"
          color="primary"
          :name="'svguse:icons.svg#' + name"
        />
        <span class="button-text-container">
          <span class="button-text">
            {{ name[0]?.toUpperCase() + name.slice(1, name.length) }}
          </span>
          <q-icon class="button-icon" color="black-54" name="mdi-arrow-right" />
        </span>
      </span>
    </q-btn>
  </a>
</template>

<script setup lang="ts">
defineProps({
  link: { type: String, default: "" },
  name: { type: String, default: "" },
});
</script>

<style lang="scss">
.button-container {
  align-items: center;
  display: flex;
  gap: 32px;
  height: 100%;
  justify-content: center;
  width: 100%;
}

.button-text {
  color: $primary;
  display: inline-block;
  font-size: 16px;
  font-weight: normal;
  line-height: 28px;
  text-align: left;
  width: 100%;

  &-container {
    align-items: center;
    display: flex;
    gap: 16px;
    width: 100%;
  }
}

.button-icon {
  height: 24px;
  width: 24px;
}
</style>

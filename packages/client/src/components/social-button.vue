<template>
  <a :href="link" rel="noopener" target="_blank">
    <q-btn outline no-caps color="primary" class="socials-button">
      <span class="button-container">
        <q-icon
          class="button-icon"
          color="primary"
          :name="'svguse:icons.svg#' + name"
        />
        <span class="button-text-container">
          <span class="button-text">
            {{ name }}
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

<style scoped lang="scss">
.socials-button {
  border-radius: 8px;
  height: 48px;
  width: 100%;
}

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
  text-transform: capitalize;
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

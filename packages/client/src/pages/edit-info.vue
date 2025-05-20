<template>
  <q-page class="column items-center">
    <info-editor
      class="flex-delegate-height-management info-editor"
      info-type="faqContent"
      @save="(text) => updateInfo('faqContent', text)"
    />
  </q-page>
</template>

<script setup lang="ts">
import InfoEditor from "src/components/info-editor.vue";

function updateInfo(
  infoType: "faqContent" | "whoAreWeContent" | "joinUsContent",
  text: string,
) {
  // TODO: update info
  infoType;
  text;
}
</script>

<style scoped lang="scss">
.info-editor {
  margin: 100px 0;
  max-width: 732px;

  @media screen and (max-width: $breakpoint-sm) {
    margin: 0;
    max-width: 100%;
  }
}
</style>

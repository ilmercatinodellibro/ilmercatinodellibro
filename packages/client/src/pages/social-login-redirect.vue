<template>
  <q-page class="flex flex-center">
    <q-spinner size="xl" color="primary" />
  </q-page>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { AvailableRouteNames } from "src/models/routes";
import { useSocialLogin } from "src/services/auth";

const router = useRouter();
const { query, params } = useRoute();
const { login } = useSocialLogin();

void (async () => {
  try {
    await login(query.token as string);
    await router.push({
      name: AvailableRouteNames.Home,
      params: {
        locationId: params.locationId,
      },
    });
  } catch (error) {
    console.error("An error occurred while logging in with socials", error);
    await router.push({
      name: "error",
    });
  }
})();
</script>

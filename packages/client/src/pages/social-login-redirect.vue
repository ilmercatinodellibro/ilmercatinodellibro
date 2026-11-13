<template>
  <q-page class="flex flex-center">
    <q-spinner size="xl" color="primary" />
  </q-page>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { AvailableRouteNames } from "@/models/routes";
import { useSocialLogin } from "@/services/auth";

const router = useRouter();
const { query, params: parameters } = useRoute();
const { login } = useSocialLogin();

// Top-level await in <script setup> would make this an async component, which requires <Suspense>
// eslint-disable-next-line unicorn/prefer-top-level-await
void (async () => {
  try {
    await login(query.token as string);
    await router.push({
      name: AvailableRouteNames.Home,
      params: {
        locationId: parameters.locationId,
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

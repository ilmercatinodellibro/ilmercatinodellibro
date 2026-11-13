import { defineBoot } from "#q-app";
import { initTokenRefresh } from "@/services/auth";

export default defineBoot(({ router }) => {
  // We cannot run from within auth service file directly, as we won't have access to router instance there
  initTokenRefresh(router);
});

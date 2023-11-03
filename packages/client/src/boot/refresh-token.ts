import { boot } from "quasar/wrappers";
import { initTokenRefresh } from "src/services/auth";

export default boot(({ router }) => {
  // We cannot run from within auth service file directly, as we won't have access to router instance there
  initTokenRefresh(router);
});

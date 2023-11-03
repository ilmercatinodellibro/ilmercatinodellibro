import ApexCharts from "apexcharts";
import { boot } from "quasar/wrappers";
import VueApexCharts from "vue3-apexcharts";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $apexcharts: typeof ApexCharts;
  }
}

export default boot(({ app }) => {
  app.use(VueApexCharts);
  app.config.globalProperties.$apexcharts = ApexCharts;
});

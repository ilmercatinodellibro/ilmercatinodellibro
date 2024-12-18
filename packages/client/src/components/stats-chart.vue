<template>
  <div
    v-if="data.length === 0 && !loading"
    class="column full-height justify-center text-h6 text-primary"
  >
    {{ t("common.noData") }}
  </div>
  <v-chart
    v-else
    :init-options="initOptions"
    :loading="loading"
    :option="option"
    autoresize
  />
</template>

<script setup lang="ts">
import { EChartsInitOpts, EChartsOption } from "echarts";
import { LineChart } from "echarts/charts";
import {
  DatasetComponent,
  GridComponent,
  TooltipComponent,
} from "echarts/components";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { computed } from "vue";
import VChart from "vue-echarts";
import { useI18n } from "vue-i18n";
import { ChartElement } from "src/@generated/graphql";
import type {
  DatasetComponentOption,
  TooltipComponentOption,
} from "echarts/components";
import type { ComposeOption } from "echarts/core";

use([
  DatasetComponent,
  GridComponent,
  TooltipComponent,
  LineChart,
  CanvasRenderer,
]);

const props = defineProps<{
  data: ChartElement[];
  loading: boolean;
}>();

const { t, locale } = useI18n();

use([CanvasRenderer, LineChart]);

const initOptions: EChartsInitOpts = {
  locale: locale.value,
  renderer: "canvas",
  width: "auto",
  height: "auto",
};

const option = computed<
  ComposeOption<DatasetComponentOption | TooltipComponentOption> & EChartsOption
>(() => ({
  dataset: [
    {
      source: [
        ["timestamp", "amount"],
        ...props.data.map(({ amount, timestamp }) => [
          new Date(timestamp),
          amount,
        ]),
      ],
    },
  ],
  xAxis: {
    type: "time",
  },
  yAxis: {},
  series: [
    {
      type: "line",
    },
  ],
  tooltip: [
    {
      trigger: "axis",
      triggerOn: "mousemove",
      formatter(value) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const [timestamp, amount] = (
          value as unknown as { data: [Date, number] }[]
        )[0]!.data;

        return `${Intl.DateTimeFormat([locale.value], {
          dateStyle: "medium",
        }).format(timestamp)}: <b>${amount}</b>`;
      },
    },
  ],
}));
</script>

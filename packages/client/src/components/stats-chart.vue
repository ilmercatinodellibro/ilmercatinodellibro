<template>
  <div ref="divRef" class="absolute-full flex-delegate-height-management" />
</template>

<script setup lang="ts">
import {
  ComposeOption,
  DatasetComponentOption,
  ECharts,
  GridComponentOption,
  init as initEchart,
  LineSeriesOption,
  TooltipComponentOption,
} from "echarts";
import { useQuasar } from "quasar";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ChartElement } from "src/@generated/graphql";

const props = defineProps<{
  data: ChartElement[];
  loading: boolean;
}>();

const { locale } = useI18n();

const { dark } = useQuasar();

const divRef = ref<HTMLDivElement>();
const chart = ref<ECharts>();
let resizeEventListener: EventListener;
onMounted(() => {
  if (!chart.value) {
    chart.value = initEchart(divRef.value, dark.isActive ? "dark" : "light", {
      locale: locale.value,
      renderer: "canvas",
      width: "auto",
      height: "auto",
    });
  }

  // To keep chart render in sync with the container's dimensions
  resizeEventListener = () => {
    chart.value?.resize();
  };
  divRef.value?.addEventListener("resize", resizeEventListener);

  if (!props.loading) {
    loadChartData();
  }
});

onUnmounted(() => {
  divRef.value?.removeEventListener("resize", resizeEventListener);
});

function loadChartData() {
  const datasetSource = props.data.map(({ amount, timestamp }) => [
    new Date(timestamp),
    amount,
  ]);
  chart.value?.setOption({
    dataset: [
      {
        source: [["timestamp", "amount"], ...datasetSource],
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
        trigger: "item",
        triggerOn: "mousemove",
        formatter(value) {
          const [timestamp, amount] = (
            value as unknown as { data: [Date, number] }
          ).data;

          return `${Intl.DateTimeFormat([locale.value], {
            dateStyle: "medium",
          }).format(timestamp)}: <b>${amount}</b>`;
        },
      },
    ],
    animationDuration: 300,
  } satisfies ComposeOption<
    | DatasetComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | LineSeriesOption
  >);
}

watch(
  () => props.loading,
  (loading) => {
    if (!chart.value) {
      return;
    }
    if (loading) {
      chart.value.showLoading();
      return;
    }

    loadChartData();
    chart.value.hideLoading();
  },
);
</script>

<template>
  <div ref="divRef" class="full-height full-width" />
</template>

<script setup lang="ts">
import { ECharts, init as initEchart } from "echarts";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ChartElement } from "src/@generated/graphql";

const props = defineProps<{
  data: ChartElement[];
  loading: boolean;
}>();

const { locale } = useI18n();

const divRef = ref<HTMLDivElement>();
const chart = ref<ECharts>();
let resizeEventListener: EventListener;
onMounted(() => {
  if (!chart.value) {
    chart.value = initEchart(divRef.value, undefined, {
      locale: locale.value,
      renderer: "canvas",
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
  chart.value?.setOption({
    xAxis: {
      type: "time",
      data: props.data.map(({ timestamp }) => timestamp),
    },
    yAxis: {
      type: "value",
    },
    series: [{ data: props.data.map(({ amount }) => amount), type: "line" }],
  });
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

<template>
  <q-field v-bind="props" v-model="model">
    <template #append>
      <q-icon :name="mdiCalendar" class="cursor-pointer" />
    </template>

    <template #control>
      {{ model ? `${model.from} - ${model.to}` : "" }}
    </template>

    <q-popup-proxy>
      <div class="row">
        <q-list dense class="q-mt-sm">
          <q-item
            v-for="preset in quickRangePresets"
            :key="preset.label"
            :active="
              model?.from === preset.value.from && model?.to === preset.value.to
            "
            active-class="bg-primary-selected"
            clickable
            @click="setModel(preset.value)"
          >
            <q-item-section>{{ preset.label }}</q-item-section>
          </q-item>
        </q-list>

        <q-separator vertical />

        <q-date
          :model-value="model?.from === model?.to ? model?.from : model"
          class="date-filter q-mt-xs"
          flat
          minimal
          range
          @update:model-value="setModel"
        >
          <div class="items-center justify-end row">
            <q-btn v-close-popup :label="t('common.close')" flat />
          </div>
        </q-date>
      </div>
    </q-popup-proxy>
  </q-field>
</template>

<script setup lang="ts">
import { mdiCalendar } from "@quasar/extras/mdi-v7";
import { QFieldProps, date } from "quasar";
import { useI18n } from "vue-i18n";
import { AvailableQuickRanges } from "src/models/date-time";

const { formatDate } = date;

type Model = { from: string; to: string } | undefined;

const props =
  // eslint-disable-next-line vue/no-unused-properties -- props are actually used in template via v-bind
  defineProps<Omit<QFieldProps, "modelValue" | "onUpdate:modelValue">>();

const model = defineModel<Model>({ required: true });

const { t } = useI18n();

const quickRangePresets: { label: string; value: NonNullable<Model> }[] = [
  {
    label: t("quickRanges.today"),
    value: getQuickRange(AvailableQuickRanges.Today),
  },
  {
    label: t("quickRanges.yesterday"),
    value: getQuickRange(AvailableQuickRanges.Yesterday),
  },
  {
    label: t("quickRanges.thisWeek"),
    value: getQuickRange(AvailableQuickRanges.ThisWeek),
  },
  {
    label: t("quickRanges.lastWeek"),
    value: getQuickRange(AvailableQuickRanges.LastWeek),
  },
  {
    label: t("quickRanges.thisMonth"),
    value: getQuickRange(AvailableQuickRanges.ThisMonth),
  },
  {
    label: t("quickRanges.lastMonth"),
    value: getQuickRange(AvailableQuickRanges.LastMonth),
  },
  {
    label: t("quickRanges.thisYear"),
    value: getQuickRange(AvailableQuickRanges.ThisYear),
  },
  {
    label: t("quickRanges.lastYear"),
    value: getQuickRange(AvailableQuickRanges.LastYear),
  },
];

function getQuickRange(preset: AvailableQuickRanges) {
  const now = new Date();
  const from = new Date();
  const to = new Date();

  switch (preset) {
    case AvailableQuickRanges.Today:
      break;
    case AvailableQuickRanges.Yesterday:
      from.setDate(now.getDate() - 1);
      to.setDate(now.getDate() - 1);
      break;
    case AvailableQuickRanges.ThisWeek:
      from.setDate(now.getDate() - now.getDay());
      to.setDate(now.getDate() + (6 - now.getDay()));
      break;
    case AvailableQuickRanges.LastWeek:
      from.setDate(now.getDate() - now.getDay() - 7);
      to.setDate(now.getDate() - now.getDay() - 1);
      break;
    case AvailableQuickRanges.ThisMonth:
      from.setDate(1);
      to.setMonth(now.getMonth() + 1);
      to.setDate(0);
      break;
    case AvailableQuickRanges.LastMonth:
      from.setMonth(now.getMonth() - 1);
      from.setDate(1);
      to.setDate(0);
      break;
    case AvailableQuickRanges.ThisYear:
      from.setMonth(0);
      from.setDate(1);
      to.setMonth(11);
      to.setDate(31);
      break;
    case AvailableQuickRanges.LastYear:
      from.setFullYear(now.getFullYear() - 1);
      from.setMonth(0);
      from.setDate(1);
      to.setFullYear(now.getFullYear() - 1);
      to.setMonth(11);
      to.setDate(31);
      break;
  }

  return {
    from: formatDate(from, "YYYY/MM/DD"),
    to: formatDate(to, "YYYY/MM/DD"),
  };
}

function setModel(value: Model | string | null) {
  if (value === null) {
    model.value = undefined;
    return;
  }

  if (typeof value !== "string") {
    model.value = value;
    return;
  }

  model.value = {
    from: value,
    to: value,
  };
}
</script>

<style lang="scss" scoped>
.date-filter :deep(.q-date__calendar) {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 220px;
}
</style>

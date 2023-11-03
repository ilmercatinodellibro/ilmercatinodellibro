<template>
  <div class="column no-wrap">
    <q-linear-progress
      rounded
      size="10px"
      :value="passwordStrengthMeterInfo.percentage / 100"
      :color="passwordStrengthMeterInfo.color"
      class="q-mt-sm"
    />
    <q-item class="q-pa-none" dense>
      <q-item-section class="denser-avatar" avatar>
        <q-icon
          :name="passwordStrengthMeterInfo.iconName"
          :color="passwordStrengthMeterInfo.color"
        />
      </q-item-section>
      <q-item-section
        :class="`text-${passwordStrengthMeterInfo.color}`"
        class="text-caption text-left"
      >
        {{ passwordStrengthMeterInfo.message }}
      </q-item-section>
    </q-item>

    <div class="no-wrap row">
      <span class="q-pt-auto"> </span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, toRefs, watch } from "vue";
import { notifyError } from "src/helpers/error-messages";
import { ServerError } from "src/models/server";
import { PasswordStrengthBarStep } from "./models";

async function checkPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("") // convert bytes to hex string
    .toUpperCase();
  const firstHalf = hashHex.slice(0, 5);
  const secondHalf = hashHex.slice(5);
  const resp = await fetch(
    `https://api.pwnedpasswords.com/range/${firstHalf}`,
    {
      method: "GET",
      mode: "cors",
    },
  );
  let secondHalfAndOccurrenceFound:
    | {
        secondHalf: string;
        numberOfOccurrences: number;
      }
    | undefined = undefined;
  if (resp.ok) {
    const reader = resp.body?.getReader();
    if (reader) {
      try {
        const { value } = await reader.read();
        if (value) {
          const arrayOfRawStrings = String.fromCharCode(...value).split("\r\n");
          for (
            let i = 0;
            i < arrayOfRawStrings.length &&
            secondHalfAndOccurrenceFound === undefined;
            i++
          ) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const splittedString = arrayOfRawStrings[i]!.split(":");
            if (splittedString[0] === secondHalf) {
              secondHalfAndOccurrenceFound = {
                secondHalf: splittedString[0],
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                numberOfOccurrences: parseInt(splittedString[1]!),
              };
            }
          }
        }
      } catch (e) {
        const { message } = e as ServerError;

        notifyError(message);

        throw e;
      }
    }
  }
  return secondHalfAndOccurrenceFound;
}

function getPercentageFromInterval(value: number, start = 0, end = 100) {
  value = Math.min(Math.max(start, value), end);
  const intervalDimension = end - start;
  return ((value - start) * 100) / intervalDimension;
}

function getValueFromPercentage(perc: number, start = 0, end = 100) {
  perc = Math.min(Math.max(start, perc), end);
  const intervalDimension = end - start;
  return (perc * intervalDimension) / 100 + start;
}

function getPercentageFromOccurrences(
  numberOfOccurrences: number,
  minOccurrences: number,
  maxOccurrences: number,
  rangeStart: number,
  rangeMax: number,
) {
  const occurrencePercentage = getPercentageFromInterval(
    numberOfOccurrences,
    minOccurrences,
    maxOccurrences,
  );
  const rangeValue = getValueFromPercentage(
    occurrencePercentage,
    rangeStart,
    rangeMax,
  );

  return getValueFromPercentage(rangeValue);
}
export default defineComponent({
  name: "PasswordStrengthBar",
  props: {
    // The actual password that needs to be validated
    passwordToCheck: {
      type: String,
      required: true,
    },
    steps: {
      type: Array as PropType<PasswordStrengthBarStep[]>,
      default: () => [
        {
          minOccurrences: 0,
          start: 0,
          end: 100,
          color: "blue",
          icon: "mdi-shield",
          message: "",
        },
      ],
      validator: (stepsToValidate: PasswordStrengthBarStep[]) =>
        stepsToValidate.every((step, index) => {
          const previousStep: PasswordStrengthBarStep | undefined =
            stepsToValidate[index - 1];
          const nextStep: PasswordStrengthBarStep | undefined =
            stepsToValidate[index + 1];

          // Compare with previous step
          if (step.start <= step.end && previousStep === undefined) {
            return true;
          }

          // Compare with next step
          if (
            previousStep !== undefined &&
            step.end <= previousStep.start &&
            previousStep.minOccurrences < step.minOccurrences &&
            nextStep === undefined
          ) {
            return true;
          }

          return (
            nextStep !== undefined &&
            nextStep.end <= step.start &&
            step.minOccurrences < nextStep.minOccurrences
          );
        }),
    },
    expectedMaximumOccurrences: {
      type: Number,
      default: 10000,
    },
  },
  setup(props) {
    const { passwordToCheck, steps } = toRefs(props);

    const numberOfOccurrencesFounded = ref<number>();

    watch(
      passwordToCheck,
      async (newPassword) => {
        if (newPassword.length === 0) {
          numberOfOccurrencesFounded.value = undefined;
        } else {
          try {
            const resp = await checkPassword(newPassword);
            const numberOfOccurrences = resp?.numberOfOccurrences ?? 0;
            numberOfOccurrencesFounded.value = numberOfOccurrences;
          } catch (e) {
            const { message } = e as ServerError;

            notifyError(message);

            throw e;
          }
        }
      },
      { immediate: true },
    );

    const currentStep = computed(() => {
      if (numberOfOccurrencesFounded.value === undefined) {
        return undefined;
      }

      let stepToReturn: PasswordStrengthBarStep & {
        maxOccurrences: number;
        occurrences: number;
      };

      let i = 0;

      do {
        stepToReturn = {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ...steps.value[i]!,
          maxOccurrences:
            steps.value[i + 1]?.minOccurrences ??
            props.expectedMaximumOccurrences,
          occurrences: numberOfOccurrencesFounded.value,
        };
        i++;
      } while (
        i < steps.value.length &&
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        steps.value[i]!.minOccurrences < numberOfOccurrencesFounded.value
      );

      return stepToReturn;
    });

    const passwordStrengthMeterInfo = computed<{
      percentage: number;
      color: string;
      message?: string;
      iconName?: string;
    }>(() => {
      return currentStep.value === undefined
        ? {
            percentage: 0,
            color: "primary",
          }
        : {
            percentage: getPercentageFromOccurrences(
              currentStep.value.occurrences,
              currentStep.value.minOccurrences,
              currentStep.value.maxOccurrences,
              currentStep.value.start,
              currentStep.value.end,
            ),
            color: currentStep.value.color,
            message: currentStep.value.message,
            iconName: currentStep.value.icon,
          };
    });

    return {
      passwordStrengthMeterInfo,
    };
  },
});
</script>

<style lang="scss" scoped>
.denser-avatar {
  min-width: 24px;
  padding-right: 6px;
}
</style>

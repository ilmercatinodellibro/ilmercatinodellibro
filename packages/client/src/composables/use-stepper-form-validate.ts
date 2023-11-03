import { QForm } from "quasar";
import { nextTick, onMounted, Ref, ref } from "vue";

export interface Step {
  name: number | string;
  formRef: Ref<QForm | undefined>;
}

function throwStepFormError(stepName: string | number): never {
  throw new Error(`Not able to find the form inside the step "${stepName}"`);
}
/**
 * IMPORTANT: Set "keep-alive" on the stepper to true
 * Allows you to properly validate all steps of a stepper component.
 * In order to make it work properly you need to create a custom component with a stepper inside and reference this composable inside
 * Then you need to wrap every single step with q-form and save their references inside a collection of objects containing the name of the step and the related formRef.
 * You also need to pass the "stepperModel" so in case of failed validation this composable auto focuses the step with validation errors.
 * @param stepperModel
 * @param steps
 */
export function useStepperFormValidate(
  stepperModel: Ref<number | string>,
  steps: readonly Step[],
) {
  const isLoading = ref(false);

  // IMPORTANT: This portion of code may fail if you place a v-if over the stepper component or over some formRefs!
  // When you create a stepper with multiple steps you need to first visit them in order to ensure that the formRefs inside are properly defined otherwise you cant validate them.
  // To accomplish that, it visits every single step and checks that the formRefs inside the steps exist.
  onMounted(async () => {
    const initialStep = stepperModel.value;

    for (let id = 0; id < steps.length; id++) {
      const currentStep = steps[id];

      if (currentStep === undefined) {
        throw new Error(`Step at position "${id}" is not defined`);
      }

      // If the step form is not defined we need to visit the step, wait for next tick and then check if it is defined
      if (currentStep.formRef.value === undefined) {
        stepperModel.value = currentStep.name;

        // FIXME: For steppers with few steps this doesn't generates issues but keep in mind that if you need to implement a stepper with lots of steps
        // you would have to improve this piece of code
        await nextTick();

        // This cast is required since TS can't understand that the previous promise can actually change the value of this ref
        if ((currentStep.formRef.value as undefined | QForm) === undefined) {
          throwStepFormError(currentStep.name);
        }
      }
    }

    // Resets initial stepperModel and loading state
    stepperModel.value = initialStep;
  });

  async function validateStepperForm() {
    isLoading.value = true;

    // To have a better UX we have decided to first validate the current step so in case you have
    // the current step and another one with validation errors you won't be redirected to the other one
    const stepsWithCurrentOneInFront = [...steps].sort(({ name }) =>
      name === stepperModel.value ? -1 : 0,
    );

    let firstStepWithValidationErrors: Step | undefined = undefined;

    for (
      let id = 0;
      id < stepsWithCurrentOneInFront.length &&
      firstStepWithValidationErrors === undefined;
      id++
    ) {
      const currentStep = stepsWithCurrentOneInFront[id];

      if (currentStep === undefined) {
        throw new Error(`Step at position "${id}" is not defined`);
      }

      if (currentStep.formRef.value === undefined) {
        throwStepFormError(currentStep.name);
      } else {
        const validationHasSucceeded =
          await currentStep.formRef.value.validate();

        if (!validationHasSucceeded) {
          firstStepWithValidationErrors = currentStep;
        }
      }
    }

    if (firstStepWithValidationErrors === undefined) {
      isLoading.value = false;
      return true;
    }

    // If there is a validation error the loops immediately ends and changes the stepper model
    stepperModel.value = firstStepWithValidationErrors.name;
    isLoading.value = false;
    return false;
  }

  return { validateStepperForm };
}

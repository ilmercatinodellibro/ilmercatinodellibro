import type { Locator, Page } from "@playwright/test";
import { expect } from "../fixtures";

/** A test scopes its fields to the page, or to a part of it such as a dialog */
type FormRoot = Page | Locator;

/** Focuses then leaves the field empty. Leaving a field triggers its validation. */
export async function leaveFieldEmpty(root: FormRoot, dataTestId: string) {
  const field = root.getByTestId(dataTestId);
  await field.focus();
  await field.blur();
}

/** Types into the field then leaves it. Leaving a field triggers its validation. */
export async function fillField(
  root: FormRoot,
  dataTestId: string,
  value: string,
) {
  const field = root.getByTestId(dataTestId);
  await field.fill(value);
  await field.blur();
}

// The wrapper holds both the input and the validation message. getByTestId()
// only reaches descendants, so the wrapper is matched by the id of its input.
function fieldOf(root: FormRoot, dataTestId: string) {
  return root.locator(`.q-field:has([data-testid="${dataTestId}"])`);
}

/** The field shows the validation message below it */
export async function fieldShouldHaveError(
  root: FormRoot,
  dataTestId: string,
  error: string,
) {
  // The previous message leaves with a transition while the new one enters,
  // so for a moment the field holds two alerts.
  await expect(
    fieldOf(root, dataTestId).getByRole("alert").filter({ hasText: error }),
  ).toBeVisible();
}

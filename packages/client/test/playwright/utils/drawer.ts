import type { Locator, Page } from "@playwright/test";
import { expect } from "../fixtures";

/**
 * Small viewports hide the drawer behind the toggle in the header, so it gets
 * opened before the callback runs. Large viewports always show it.
 */
export async function withinDrawer<T>(
  page: Page,
  callback: (drawer: Locator) => Promise<T>,
): Promise<T> {
  const drawer = page.getByTestId("page-drawer");
  await expect(drawer).toBeAttached();

  if (!(await drawer.isVisible())) {
    await page.getByRole("banner").getByTestId("drawer-button").click();
  }

  await expect(drawer).toBeVisible();

  return callback(drawer);
}

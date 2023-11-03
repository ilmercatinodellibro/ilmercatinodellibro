/**
 * The drawer is hidden in smaller viewports, so we need to ensure it's open
 */
export function withinDrawer(callback: () => void) {
  cy.dataCy("drawer-button").then((drawerButton) => {
    if (drawerButton.attr("aria-expanded") !== "true") {
      drawerButton.trigger("click");
    }

    cy.dataCy("page-drawer").should("be.visible");
    cy.dataCy("page-drawer").within(() => {
      callback();
    });
  });
}

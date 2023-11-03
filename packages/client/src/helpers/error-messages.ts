import { Notify } from "quasar";

export function notifyError(message: string, dataCy = "error-notification") {
  Notify.create({
    type: "negative",
    message,
    attrs: {
      "data-cy": dataCy,
    },
  });
}

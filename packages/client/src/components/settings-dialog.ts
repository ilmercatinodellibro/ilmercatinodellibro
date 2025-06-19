import { RetailLocationSettingsFragment } from "src/services/retail-location.graphql";

export type SettingsUpdate =
  | {
      type: "save";
      settings: RetailLocationSettingsFragment;
    }
  | { type: "reset" }
  | { type: "export-users" };

export type SettingsDialogProps = Omit<
  RetailLocationSettingsFragment,
  "__typename"
>;

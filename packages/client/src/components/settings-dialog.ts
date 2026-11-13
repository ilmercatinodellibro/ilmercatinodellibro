import type { RetailLocationSettingsFragment } from "@/services/retail-location.graphql";

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

import { RetailLocationSettingsFragment } from "src/services/retail-location.graphql";

export type SettingsDialogProps = Omit<
  RetailLocationSettingsFragment,
  "__typename"
> & { retailLocationId: string };

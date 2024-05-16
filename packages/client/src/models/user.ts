import { RegisterUserPayload, UpdateUserPayload } from "src/@generated/graphql";

export type UserData = Omit<
  UpdateUserPayload,
  "__typename" | "id" | "retailLocationId" | "discount" | "notes"
> & { email: string; confirmEmail: string };

export type UserDialogPayload =
  | {
      type: "create";
      data: RegisterUserPayload;
    }
  | {
      type: "update";
      data: UpdateUserPayload;
    }
  | {
      type: "toggleDeletion";
      data: { id: string };
    }
  | {
      type: "downloadData";
      data: { id: string };
    };

import { useApolloClient } from "@vue/apollo-composable";
import { Notify, exportFile } from "quasar";
import { useI18n } from "vue-i18n";
import { notifyError } from "src/helpers/error-messages";
import { GetUserDataDocument } from "src/services/user.graphql";

export function useDownloadUserData() {
  const { t } = useI18n();
  const { resolveClient } = useApolloClient();

  async function downloadData(userId: string) {
    const client = resolveClient();
    const { data, error } = await client.query({
      query: GetUserDataDocument,
      variables: {
        userId,
      },
      fetchPolicy: "network-only",
    });
    if (error) {
      notifyError(t("auth.couldNotDownload"));
      return;
    }

    const stringifiedData = JSON.stringify(data.userData, null, 2);
    const result = exportFile("userData.json", stringifiedData, {
      mimeType: "application/json",
    });
    if (result !== true) {
      notifyError(t("auth.couldNotDownload"));
      return;
    }
    Notify.create({
      type: "positive",
      message: t("manageUsers.editUser.downloadDataSuccess"),
    });
  }

  return {
    downloadData,
  };
}

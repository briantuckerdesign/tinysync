import { flows } from "../..";
import { ui } from "../../../ui";
import { createToken } from "../../manage-tokens/create-tokens";

export async function saveWebflowToken(accessToken: any) {
  // Ask user if they want to save the API token
  const saveToken = await ui.prompt.confirm({
    message: "Save this access token to use in other syncs?",
  });
  // Handle cancel
  if (ui.prompt.isCancel(saveToken)) {
    await flows.viewSyncs();
    process.exit(0);
  }
  if (saveToken) await createToken(accessToken, "webflow");
}

import { flows } from "../..";
import { state } from "../../../state";
import { ui } from "../../../ui";
import { checkWebflowKey } from "./check-key";

export async function selectWebflowKey(): Promise<KeyAuth> {
  let apiKey, createdThisSession;

  // Get Airtable keys from config
  let webflowKeys = state.config.keys.filter(
    (key) => key.platform === "webflow"
  ) as any;

  // If there are keys, ask user to select one
  if (webflowKeys.length > 0) {
    // Add "Create new key" option to beginning of array
    let newKey = { label: "Create new key", value: "createNewKey" };
    webflowKeys.unshift(newKey);

    apiKey = await ui.prompt.select({
      message: "Webflow API token:",
      options: webflowKeys,
    });
    // Handle cancel
    if (ui.prompt.isCancel(apiKey)) {
      await flows.viewSyncs();
      process.exit(0);
    }
  }

  // If user selects "Create new key", or no saved keys...
  if (apiKey === "createNewKey" || webflowKeys.length === 0) {
    createdThisSession = true;
    // Ask for new API token
    apiKey = await ui.prompt.password({
      message: "Webflow API token:",
    });
    // Handle cancel
    if (ui.prompt.isCancel(apiKey)) {
      await flows.viewSyncs();
      process.exit(0);
    }
  }

  // If successful, we save the sites that were returned
  const sites = await checkWebflowKey(apiKey);

  if (!sites) {
    // Otherwise, we ask the user to try again
    await selectWebflowKey();
    process.exit(0);
  }
  return {
    apiKey,
    sites,
    createdThisSession,
  };
}

interface KeyAuth {
  apiKey: any;
  sites: any; //todo: type
  createdThisSession: boolean;
}

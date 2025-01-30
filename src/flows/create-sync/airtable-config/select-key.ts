import { flows } from "../..";
import { state } from "../../../state";
import { ui } from "../../../ui";
import { checkAirtableKey } from "./check-key";

export async function selectAirtableKey(): Promise<KeyAuth> {
  let apiKey, createdThisSession;

  // Get Airtable keys from config
  let airtableKeys = state.config.keys.filter(
    (key) => key.platform === "airtable"
  ) as any;

  // If there are keys, ask user to select one
  if (airtableKeys.length > 0) {
    // Add "Create new key" option to beginning of array
    let newKey = { label: "Create new key", value: "createNewKey" };
    airtableKeys.unshift(newKey);

    apiKey = await ui.prompt.select({
      message: "Airtable API token:",
      options: airtableKeys,
    });
    // Handle cancel
    if (ui.prompt.isCancel(apiKey)) {
      await flows.viewSyncs();
      process.exit(0);
    }
  }

  // If user selects "Create new key", or no saved keys...
  if (apiKey === "createNewKey" || airtableKeys.length === 0) {
    createdThisSession = true;
    // Ask for new API token
    apiKey = await ui.prompt.password({
      message: "Airtable API token:",
    });
    // Handle cancel
    if (ui.prompt.isCancel(apiKey)) {
      await flows.viewSyncs();
      process.exit(0);
    }
  }

  // If successful, we save the bases that were returned
  const bases = await checkAirtableKey(apiKey);

  if (!bases) {
    // Otherwise, we ask the user to try again
    await selectAirtableKey();
    process.exit(0);
  }
  return {
    apiKey,
    bases,
    createdThisSession,
  };
}

interface KeyAuth {
  apiKey: any;
  bases: Array<AirtableBasesListItem>;
  createdThisSession: boolean;
}

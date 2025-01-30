import { flows } from "../..";
import { ui } from "../../../ui";
import { createKey } from "../../manage-keys/create-key";

export async function saveAirtableKey(apiKey: any) {
  // Ask user if they want to save the API token
  const saveKey = await ui.prompt.confirm({
    message: "Save this key to use in other syncs?",
  });
  // Handle cancel
  if (ui.prompt.isCancel(saveKey)) {
    await flows.viewSyncs();
    process.exit(0);
  }
  if (saveKey) await createKey(apiKey, "airtable");
}

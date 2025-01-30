import { WebflowClient } from "webflow-api";
import { flows } from "../..";
import { state } from "../../../state";
import { ui } from "../../../ui";
import { checkWebflowToken } from "./check-token";
import { Site } from "webflow-api/api";

export async function selectWebflowtoken(): Promise<KeyAuth> {
  let accessToken, createdThisSession;

  // Get Airtable keys from config
  let webflowTokens = state.config.tokens.filter(
    (key) => key.platform === "webflow"
  ) as any;

  // If there are keys, ask user to select one
  if (webflowTokens.length > 0) {
    // Add "Create new key" option to beginning of array
    let newToken = {
      label: "Create new access token",
      value: "createNewToken",
    };
    webflowTokens.unshift(newToken);

    accessToken = await ui.prompt.select({
      message: "Webflow access token:",
      options: webflowTokens,
    });
    // Handle cancel
    if (ui.prompt.isCancel(accessToken)) {
      await flows.viewSyncs();
      process.exit(0);
    }
  }

  // If user selects "Create new key", or no saved keys...
  if (accessToken === "createNewToken" || webflowTokens.length === 0) {
    createdThisSession = true;
    // Ask for new API token
    accessToken = await ui.prompt.password({
      message: "Webflow API token:",
    });
    // Handle cancel
    if (ui.prompt.isCancel(accessToken)) {
      await flows.viewSyncs();
      process.exit(0);
    }
  }

  // If successful, we save the sites that were returned
  const sites = await checkWebflowToken(accessToken);

  if (!sites) {
    // Otherwise, we ask the user to try again
    await selectWebflowtoken();
    process.exit(0);
  }
  return {
    accessToken,
    sites,
    createdThisSession,
  };
}

interface KeyAuth {
  accessToken: string;
  sites: Site[];
  createdThisSession: boolean;
}

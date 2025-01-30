import { flows } from "../..";
import { state } from "../../../state";
import { ui } from "../../../ui";
import { checkAirtableToken } from "./check-token";

export async function selectAirtableToken(): Promise<TokenAuth> {
  let accessToken, createdThisSession;

  // Get Airtable tokens from config
  let airtableTokens = state.config.tokens.filter(
    (token) => token.platform === "airtable"
  ) as any;

  // If there are tokens, ask user to select one
  if (airtableTokens.length > 0) {
    // Add "Create new access token" option to beginning of array
    let newToken = {
      label: "Create new access token",
      value: "createNewToken",
    };
    airtableTokens.unshift(newToken);

    accessToken = await ui.prompt.select({
      message: "Airtable access token:",
      options: airtableTokens,
    });
    // Handle cancel
    if (ui.prompt.isCancel(accessToken)) {
      await flows.viewSyncs();
      process.exit(0);
    }
  }

  // If user selects "Create new access token", or no saved tokens...
  if (accessToken === "createNewToken" || airtableTokens.length === 0) {
    createdThisSession = true;
    // Ask for new access token
    accessToken = await ui.prompt.password({
      message: "Airtable access token:",
    });
    // Handle cancel
    if (ui.prompt.isCancel(accessToken)) {
      await flows.viewSyncs();
      process.exit(0);
    }
  }

  // If successful, we save the bases that were returned
  const bases = await checkAirtableToken(accessToken);

  if (!bases) {
    // Otherwise, we ask the user to try again
    await selectAirtableToken();
    process.exit(0);
  }
  return {
    accessToken: accessToken,
    bases,
    createdThisSession,
  };
}

interface TokenAuth {
  accessToken: any;
  bases: Array<AirtableBasesListItem>;
  createdThisSession: boolean;
}

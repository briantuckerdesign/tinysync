import { history } from "../../../../history";
import { state } from "../../../../state";
import { ui } from "../../../../ui";
import { checkAirtableToken } from "./check-token";

export async function selectAirtableToken(): Promise<TokenAuth> {
  history.add(selectAirtableToken);

  try {
    let accessToken;
    let createdThisSession = false;

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
      await ui.handleCancel(accessToken);
    }

    // If user selects "Create new access token", or no saved tokens...
    if (accessToken === "createNewToken" || airtableTokens.length === 0) {
      createdThisSession = true;
      // Ask for new access token
      accessToken = await ui.prompt.password({
        message: "Airtable access token:",
      });
      await ui.handleCancel(accessToken);
    }

    // If successful, we save the bases that were returned
    const bases = await checkAirtableToken(accessToken);
    if (!bases) {
      // Otherwise, we recursively ask the user to try again
      await selectAirtableToken();
      return;
    }
    return {
      accessToken,
      bases,
      createdThisSession,
    };
  } catch (error) {
    ui.prompt.log.error("Error selecting Airtable token.");
    history.back();
    return;
  }
}

interface TokenAuth {
  accessToken: string;
  bases: Array<AirtableBasesListItem>;
  createdThisSession: boolean;
}

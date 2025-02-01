import { state } from "../../state";
import { ui } from "../../ui";
import { toolbelt } from "../../toolbelt/index";
import { flows } from "../index";
import { createToken } from "./create-tokens";
import { manageKey } from "./manage-tokens";

export async function manageTokens() {
  try {
    ui.prompt.log.info(ui.format.bold("🔑 Manage access tokens"));

    const tokensToPickFrom = state.config.tokens;

    // create name that equals label
    // `name` prop is required for clack, otherwise we'd just use `label`
    tokensToPickFrom.forEach((tokenToPick) => {
      if (tokenToPick.platform === "webflow") {
        tokenToPick.name = `${tokenToPick.label} [Webflow]`;
      }
      if (tokenToPick.platform === "airtable") {
        tokenToPick.name = `${tokenToPick.label} [Airtable]`;
      }
    });

    const tokensToSelect =
      toolbelt.encapsulateObjectForSelect(tokensToPickFrom);

    const createNewToken = {
      value: "createNewToken",
      label: "+ Create new access token",
    };
    tokensToSelect.unshift(createNewToken); // add at the beginning

    let back = { value: "back", label: "Back" };
    tokensToSelect.push(back); // add at the end

    const selectedToken = (await ui.prompt.select({
      message: "Select an access token",
      options: tokensToSelect,
    })) as any;
    if (ui.prompt.isCancel(selectedToken)) {
      await flows.mainMenu();
      return;
    }

    if (selectedToken === "createNewToken") {
      await createToken();
    } else if (selectedToken === "back") {
      await flows.mainMenu();
    } else {
      const token = state.config.tokens.find(
        (token) => token.id === selectedToken.id
      );
      if (!token) return;
      await manageKey(token);
    }
  } catch (error) {
    console.log(error);
    ui.prompt.log.error("Error managing keys.");
    await flows.mainMenu();
    return;
  }
}

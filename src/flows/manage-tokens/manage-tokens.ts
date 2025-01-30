import { state } from "../../state";
import { ui } from "../../ui";
import { flows } from "..";
import { renameKey } from "./rename-tokens";
import { deleteKey } from "./delete-tokens";
import { manageTokens } from ".";

export async function manageKey(selectedKey) {
  try {
    const selectedAction = await ui.prompt.select({
      message: "What would you like to do?",
      options: [
        { value: "renameKey", label: "Rename key" },
        { value: "deleteKey", label: "Delete key" },
        { value: "back", label: "Back" },
      ],
    });
    if (ui.prompt.isCancel(selectedAction)) {
      await flows.manageTokens();
      return;
    }

    switch (selectedAction) {
      case "renameKey":
        await renameKey(selectedKey);
        break;
      case "deleteKey":
        await deleteKey(selectedKey);
        break;
      default:
        await manageTokens();
    }
  } catch (error) {
    ui.prompt.log.error("Error managing key.");
    process.exit(0);
  }
}

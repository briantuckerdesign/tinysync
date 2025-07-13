import { state } from "../../../state";
import { ui } from "../../../ui";
import { configTools } from "../../../config-tools";
import { manageToken } from "./manage-token";
import { manageTokens } from ".";

export async function deleteKey(keyToDelete: Token) {
  try {
    const confirmDelete = await ui.prompt.confirm({
      message: `Are you sure you want to delete ${ui.format.bold(
        keyToDelete.label
      )}?`,
    });
    if (ui.prompt.isCancel(confirmDelete) || !confirmDelete) {
      await manageToken(keyToDelete);
      return;
    }

    state.config.tokens = state.config.tokens.filter(
      (key) => key.id !== keyToDelete.id
    );
    await configTools.save();
    ui.prompt.log.success("✅ Key deleted!");

    await manageTokens();
  } catch (error) {
    ui.prompt.log.error("Error deleting key.");
    process.exit(0);
  }
}

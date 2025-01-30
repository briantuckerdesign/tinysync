import { state } from "../../state";
import { ui } from "../../ui";
import { flows } from "..";
import { configTools } from "../../config-tools";
import { manageKey } from "./manage-key";

export async function deleteKey(keyToDelete: Key) {
  try {
    const confirmDelete = await ui.prompt.confirm({
      message: `Are you sure you want to delete ${ui.format.bold(
        keyToDelete.label
      )}?`,
    });
    if (ui.prompt.isCancel(confirmDelete) || !confirmDelete) {
      await manageKey(keyToDelete);
      return;
    }

    state.config.keys = state.config.keys.filter(
      (key) => key.id !== keyToDelete.id
    );
    await configTools.save();
    ui.prompt.log.success("✅ Key deleted!");

    await flows.manageKeys();
  } catch (error) {
    ui.prompt.log.error("Error deleting key.");
    process.exit(0);
  }
}

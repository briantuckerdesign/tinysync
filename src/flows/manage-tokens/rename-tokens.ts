import { configTools } from "../../config-tools";
import { state } from "../../state";
import { ui } from "../../ui";
import { flows } from "..";
import { manageKey } from "./manage-tokens";

export async function renameKey(key: Key) {
  try {
    const newLabel = await ui.prompt.text({
      message: "Enter a new label",
      initialValue: key.label,
    });

    if (ui.prompt.isCancel(newLabel)) {
      await manageKey(key);
      return;
    }

    key.label = newLabel;

    await configTools.save();
    ui.prompt.log.success("✅ Key renamed!");

    await flows.manageTokens();
  } catch (error) {
    ui.prompt.log.error("Error renaming key.");
    process.exit(0);
  }
}

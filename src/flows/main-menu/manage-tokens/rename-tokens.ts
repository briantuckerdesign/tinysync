import { manageTokens } from ".";
import { configTools } from "../../../config-tools";
import { ui } from "../../../ui";
import { manageToken } from "./manage-token";

export async function renameToken(token: Token) {
  try {
    const newLabel = await ui.prompt.text({
      message: "Enter a new label",
      initialValue: token.label,
    });

    if (ui.prompt.isCancel(newLabel)) {
      await manageToken(token);
      return;
    }

    token.label = newLabel;

    await configTools.save();
    ui.prompt.log.success("✅ Token renamed!");

    await manageTokens();
  } catch (error) {
    ui.prompt.log.error("Error renaming token.");
    process.exit(0);
  }
}

/* -------------------------------------------------------------------------- */
/*                           Flows / Change password                          */
/* -------------------------------------------------------------------------- */
/**
 * 1. Ask user to confirm
 * 2. If no, return to main menu
 * 3. If yes, ask for new password
 * 4. Confirm new password
 * 5. If passwords do not match, return to step 3
 * 6. If passwords match, change password in config
 * 7. Save config using new password
 *
 */

import { ui } from "../ui";
import { configTools } from "../config-tools/index";
import { flows } from "./index";
import { createPassword } from "./login/create-password";

export async function changePassword() {
  const confirmChange = await ui.prompt.confirm({
    message: "Are you sure you want to change your password?",
  });

  if (ui.prompt.isCancel(confirmChange) || !confirmChange) {
    ui.prompt.log.message(ui.format.yellow("Ok..."));
    await flows.mainMenu();
    return;
  }

  if (confirmChange) {
    await createPassword();
    ui.prompt.log.success("Password changed!");
    await configTools.save();
    await flows.mainMenu();
    return;
  }
}

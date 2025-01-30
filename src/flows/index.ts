/* -------------------------------------------------------------------------- */
/*                                    Flows                                   */
/* -------------------------------------------------------------------------- */
/**
 * Flows are the main entry points for the application.
 *
 * Each user flow is visualized here:
 * https://www.figma.com/file/obXOZS1GoeVKKjJojHK0Dl/User-Flows
 */
import { login } from "./login";
import { mainMenu } from "./main-menu";
import { viewSync } from "./view-sync";
import { viewSyncs } from "./view-syncs";
import { createSync } from "./create-sync/index";
import { manageKeys } from "./manage-keys";
import { changePassword } from "./change-password";

export const flows = {
  manageKeys,
  login,
  mainMenu,
  viewSyncs,
  viewSync,
  createSync,
  changePassword,
};

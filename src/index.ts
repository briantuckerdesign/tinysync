/* -------------------------------------------------------------------------- */
/*                                    Start                                   */
/* -------------------------------------------------------------------------- */
/**
 * 1. Initialize state & loader
 * 2. Display welcome message
 * 3. Attempt login flow
 * 4. If successful, begin main menu flow
 */

// TODO: Implement secure logging
// TODO: Error handling

import { flows } from "./flows/index";
import { toolbelt } from "./toolbelt";
import pack from "../package.json";
import { ui } from "./ui";
import { skip } from "./dev/skip";

(async () => {
  try {
    await ui.welcome();
    ui.prompt.intro(ui.format.dim(`tinySync v${pack.version}`));
    // await skip();
    await flows.login();
    await flows.mainMenu();
    ui.prompt.outro(`See ya later! 👋`);
  } catch (error) {
    ui.prompt.log.error("There was an error running tinySync.");
    ui.prompt.log.error(error);
  }
})();

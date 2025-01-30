import { ui } from "../ui";
import { flows } from "./index";

/**
 * 1. Ask user how to proceed
 * 2. Execute selected option
 */
export async function mainMenu() {
  try {
    ui.prompt.log.info(ui.format.bold("🏠 Menu"));
    const menu = await ui.prompt.select({
      message: "What would you like to do?",
      options: [
        { value: "viewSyncs", label: "View syncs" },
        { value: "manageTokens", label: "Manage access tokens" },
        { value: "changePassword", label: "Change password" },
        { value: "exit", label: "Exit", hint: "Bye!" },
      ],
    });

    switch (menu) {
      case "viewSyncs":
        await flows.viewSyncs();
        break;
      case "manageTokens":
        await flows.manageTokens();
        break;
      case "changePassword":
        await flows.changePassword();
        break;
      default:
        ui.prompt.outro("See ya later! 👋");
        process.exit(0);
    }
  } catch (error) {
    ui.prompt.log.error("Error running main menu.");
    process.exit(0);
  }
}

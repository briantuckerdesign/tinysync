import { state } from "../state";
import { ui } from "../ui";
import { flows } from "./index";

/**
 * 1. Create array of syncs from config
 * 2. Add additional options to array
 * 3. Ask user how to proceed
 * 4. Execute selected option
 */
export async function viewSyncs() {
  try {
    const syncs = (state.config.syncs || []) as any;

    // Formats syncs for select prompt
    const choices = syncs.map((sync) => {
      return {
        label: `💎 ${ui.format.bold(sync.name)}`,
        value: sync,
      };
    });

    choices.push(
      {
        label: "Create new sync",
        value: "createSync",
      },
      {
        label: "Back",
        value: "back",
      },
      {
        label: "Exit",
        value: "exit",
      }
    );

    // Returns the selected sync
    let selectedSync = await ui.prompt.select({
      message: ui.format.bold("🔍 View syncs"),
      options: choices,
    });

    if (ui.prompt.isCancel(selectedSync)) {
      await flows.mainMenu();
    }

    switch (selectedSync) {
      case "back":
        await flows.mainMenu();
        break;
      case "exit":
        ui.prompt.outro("See ya later! 👋");
        process.exit();
      case "createSync":
        await flows.createSync();
        break;
      default:
        await flows.viewSync(selectedSync as Sync);
        break;
    }
  } catch (error) {
    ui.prompt.log.error("Error viewing syncs.");
    process.exit(0);
  }
}

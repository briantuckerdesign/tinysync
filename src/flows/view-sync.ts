/**
 * 1. Displays sync details:
 *    - Sync name
 *    - Custom domains
 *    - Site/Base
 *    - Table/Collection
 *    - Settings
 * 2. [ Ask user ] how to proceed
 *    - "Sync" -> run sync
 *    - "Publish site" -> publish site
 *    - "Delete sync" -> delete sync
 *    - "Back" -> view syncs
 */

import { state } from "../state";
import { sync } from "../sync";
import { ui } from "../ui";
import { flows } from ".";
import { AsciiTable3 } from "ascii-table3";

export async function viewSync(syncConfig: Sync, firstRun = false) {
  try {
    if (firstRun) {
      let note = `Sync:\n${ui.format.bold(syncConfig.name)}\n`;

      if (syncConfig.webflow.site.customDomains) {
        for (const domain of syncConfig.webflow.site.customDomains) {
          note += `\n${domain}`;
        }
      } else {
        note += `\nNo domains found, publishing to Webflow subdomain\n`;
      }

      let syncDetails = new AsciiTable3()
        .setHeading("", "Airtable", "Webflow")
        .addRowMatrix([
          [
            "Site/Base",
            syncConfig.airtable.base.name,
            syncConfig.webflow.site.name,
          ],
          [
            "Table/Collection",
            syncConfig.airtable.table.name,
            syncConfig.webflow.collection.name,
          ],
        ]);

      note += `\n${syncDetails.toString()}`;

      let settings = new AsciiTable3()
        .setHeading("Setting", "Value")
        .addRowMatrix([
          ["Publish on error", syncConfig.autoPublish],
          ["Airtable SSOT", syncConfig.deleteRecords],
        ]);

      note += `\n${settings.toString()}`;

      ui.prompt.note(note);
    }

    ui.prompt.log.info(`💎 ${ui.format.bold(syncConfig.name)}`);
    const syncMessage = "What would you like to do?";
    const syncChoices = [
      {
        label: "Sync",
        value: "runSync",
      },
      { label: "Publish site", value: "publishSite" },
      { label: "Delete sync", value: "deleteSync" },
      { label: "Back", value: "back" },
      { label: "Exit", value: "exit" },
    ];

    // Asks user what they want to do with the selected sync
    const userChoice = await ui.prompt.select({
      message: syncMessage,
      options: syncChoices,
    });

    switch (userChoice) {
      case "runSync":
        await sync.run(syncConfig);
        break;
      case "publishSite":
        await sync.publish(state, syncConfig);
        break;
      case "deleteSync":
        await sync.delete(state, syncConfig);

      case "back":
        await flows.viewSyncs();
        break;
      case "exit":
        ui.prompt.outro("See ya later! 👋");
        process.exit();
      default:
        break;
    }
  } catch (error) {
    ui.prompt.log.error("Error viewing sync.");
    process.exit(0);
  }
}

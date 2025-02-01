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

export async function viewSync(firstRun = false) {
  try {
    const syncDetails = state.config.selectedSync;
    if (firstRun) {
      let note = `Sync:\n${ui.format.bold(syncDetails.name)}\n`;

      if (syncDetails.webflow.site.customDomains) {
        for (const domain of syncDetails.webflow.site.customDomains) {
          note += `\n${domain}`;
        }
      } else {
        note += `\nNo domains found, publishing to Webflow subdomain\n`;
      }

      const syncTable = new AsciiTable3()
        .setHeading("", "Airtable", "Webflow")
        .addRowMatrix([
          [
            "Site/Base",
            syncDetails.airtable.base.name,
            syncDetails.webflow.site.name,
          ],
          [
            "Table/Collection",
            syncDetails.airtable.table.name,
            syncDetails.webflow.collection.name,
          ],
        ]);

      note += `\n${syncTable.toString()}`;

      const settings = new AsciiTable3()
        .setHeading("Setting", "Value")
        .addRowMatrix([
          ["Publish on error", syncDetails.autoPublish],
          ["Airtable SSOT", syncDetails.deleteRecords],
        ]);

      note += `\n${settings.toString()}`;

      ui.prompt.note(note);
    }

    ui.prompt.log.info(`💎 ${ui.format.bold(syncDetails.name)}`);
    const syncMessage = "What would you like to do?";
    const syncChoices = [
      {
        label: "Sync",
        value: "runSync",
      },
      {
        label: "View details",
        value: "viewDetails",
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
        await sync.run();
        break;
      case "viewDetails":
        await sync.viewDetails();
        break;
      case "publishSite":
        await sync.publish(); // remove state
        break;
      case "deleteSync":
        await sync.delete(); // remove state

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

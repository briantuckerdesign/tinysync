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

import { AsciiTable3 } from "ascii-table3";
import { ui } from "../../../../ui";
import { state } from "../../../../state";
import { history } from "../../../../history";

export async function viewSyncDetails() {
  history.add(viewSyncDetails);

  try {
    const selectedSync = state.config.selectedSync;
    /**
     * log
     * - sync name
     * - auto publish
     * - delete records
     * - publish to subdomain
     * - custom domains
     * - airtbale base name
     * - airtable table name
     * - webflow site name
     * - webflow collection name
     * - matched fields (table, left webflow right airtable) names/types
     */

    // Display sync header info
    ui.prompt.log.info(`\nSync Details: ${selectedSync.name}`);

    // Display basic settings
    const settingsTable = new AsciiTable3("Settings")
      .setHeading("Setting", "Value")
      .addRow(
        "Auto publish site on item publishing error",
        selectedSync.autoPublish ? "✓" : "✗"
      )
      .addRow(
        "Delete records at destination if deleted at source",
        selectedSync.deleteRecords ? "✓" : "✗"
      )
      .addRow(
        "Publish to webflow.io subdomain",
        selectedSync.publishToSubdomain ? "✓" : "✗"
      );

    ui.prompt.log.info(settingsTable.toString());

    // Display custom domains if any
    if (selectedSync.webflow.site.customDomains?.length) {
      const domainsTable = new AsciiTable3("Custom Domains").setHeading(
        "Domain"
      );
      selectedSync.webflow.site.customDomains.forEach((domain) => {
        domainsTable.addRow(domain.url);
      });
      ui.prompt.log.info(domainsTable.toString());
    }

    // Display connection details
    const connectionsTable = new AsciiTable3("Connections")
      .setHeading("Platform", "Details")
      .addRow("Airtable Base", selectedSync.airtable.base.name)
      .addRow("Airtable Table", selectedSync.airtable.table.name)
      .addRow("Webflow Site", selectedSync.webflow.site.name || "Unknown")
      .addRow(
        "Webflow Collection",
        selectedSync.webflow.collection.name || "Unknown"
      );

    ui.prompt.log.info(connectionsTable.toString());

    let fieldsTable = new AsciiTable3("Field Mappings").setHeading(
      "Webflow Field",
      "Type",
      "Airtable Field",
      "Type"
    );

    selectedSync.fields.forEach((field) => {
      fieldsTable.addRow(
        field.webflow?.displayName || "N/A",
        field.webflow?.type || "N/A",
        field.airtable?.name || "N/A",
        field.airtable?.type || "N/A"
      );
    });

    console.log(selectedSync.fields);

    ui.prompt.log.info(fieldsTable.toString());
  } catch (error) {
    ui.prompt.log.error("Error viewing sync details.");
  } finally {
    await history.back();
    return;
  }
}

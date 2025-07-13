/**
 * Settings
 *
 * 1. Ask user to name the sync
 *
 * 2. Ask user if they want to auto publish when validation
 *    error occurs. This is a common error, but risky if often
 *    making changes directly in Webflow.
 *
 * 3. Ask user if they want to delete records from Webflow if
 *    they are deleted in Airtable. I think of this is
 *    "Total sync mode", where Airtable is the source of truth.
 *    What you see in Airtable is what you get in Webflow.
 *
 * 4. Ask user if they want to publish to webflow.io subdomain
 */

import { history } from "../../../history";
import { ui } from "../../../ui";

export async function getSettings(
  webflowConfig: WebflowConfig
): Promise<SyncSettings> {
  history.add(getSettings, [webflowConfig], false);
  try {
    const settings = (await ui.prompt.group(
      {
        syncName: () =>
          ui.prompt.text({ message: "What would you like to name this sync?" }),
        autoPublish: () =>
          ui.prompt.confirm({
            message: "Automatically publish site if validation error occurs?",
          }),
        deleteRecords: () =>
          ui.prompt.confirm({
            message:
              "Delete records from Webflow if they are deleted in Airtable?",
          }),
      },
      {
        onCancel: async ({ results }) => {
          await history.back();
          return;
        },
      }
    )) as SyncSettings;

    if (webflowConfig.site.customDomains) {
      const publishToSubdomain = await ui.prompt.confirm({
        message: "Publish to webflow.io subdomain?",
      });

      await ui.handleCancel(publishToSubdomain);

      settings.publishToSubdomain = publishToSubdomain as boolean;
    } else {
      // TODO: Check if when customDomain length is 0, that there's no special flag needed to publish to subdomain
      settings.publishToSubdomain = true;
    }
    return settings;
  } catch (error) {
    ui.prompt.log.error("Error getting settings.");
    history.back();
    return;
  }
}

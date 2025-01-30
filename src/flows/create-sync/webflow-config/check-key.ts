import { ui } from "../../../ui";
import { state } from "../../../state";
import { WebflowClient } from "webflow-api";
import { Site } from "webflow-api/api";

export async function checkWebflowKey(
  key: any
): Promise<Array<Site> | undefined> {
  // Check if API token is valid by trying to get bases
  ui.spinner.start("Checking API token...");
  try {
    state.webflowClient = new WebflowClient({ accessToken: key });
    const sites = await state.webflowClient.sites.list();

    // If API token is invalid, ask user to try again
    if (!sites) {
      ui.prompt.log.error("Something went wrong.");
      ui.prompt.log.message(
        "Either your key is invalid, or it doesn't have proper permissions."
      );
      ui.prompt.log.message("Please try again.");
      ui.spinner.stop();
      return undefined;
    }
    ui.spinner.stop(`✅ ${ui.format.dim("Webflow key validated.")}`);

    return sites.sites;
  } catch (e) {
    ui.prompt.log.error(e);
    ui.spinner.stop();
    process.exit(0);
  }
}

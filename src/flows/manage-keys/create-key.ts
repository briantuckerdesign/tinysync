import { state } from "../../state";
import { ui } from "../../ui";
import { flows } from "..";
import { airtable } from "../../airtable";
import { webflow } from "../../webflow";
import { configTools } from "../../config-tools";
import { v4 as uuidv4 } from "uuid";

export async function createKey(
  verifiedKey?: any,
  verifiedPlatform?: "airtable" | "webflow"
) {
  let platform, apiKey, keyLabel;

  if (verifiedKey && verifiedPlatform) {
    platform = verifiedPlatform;
    apiKey = verifiedKey;
  } else {
    // Ask user for platform
    platform = await ui.prompt.select({
      message: "Select a platform",
      options: [
        { value: "airtable", label: "Airtable" },
        { value: "webflow", label: "Webflow" },
      ],
    });
    if (ui.prompt.isCancel(platform)) {
      await flows.manageKeys();
      return;
    }

    // Ask user for API key
    apiKey = await ui.prompt.password({ message: "API key" });
    if (ui.prompt.isCancel(apiKey)) {
      await flows.manageKeys();
      return;
    }

    // test token
    if (platform === "airtable") {
      ui.spinner.start("Checking API token...");
      let bases = await airtable.getBases(apiKey);

      // If API token is invalid, ask user to try again
      if (!bases) {
        ui.prompt.log.error(
          "Either your token is invalid, or it doesn't have 'create' permissions on any bases."
        );
        ui.spinner.stop();
        return await flows.manageKeys(); // Recursively call the function again
      }
      ui.spinner.stop(`✅ ${ui.format.dim("Airtable token validated.")}`);
    }
    if (platform === "webflow") {
      ui.spinner.start("Checking API key...");

      let sites = await webflow.getSites(apiKey, state);

      // If API token is invalid, ask user to try again
      if (!sites) {
        ui.prompt.log.error(
          "Either your key is invalid, or it doesn't have proper permissions."
        );
        ui.spinner.stop();
        return await flows.manageKeys(); // Recursively call the function again
      }
      ui.spinner.stop(`✅ ${ui.format.dim("Webflow key validated.")}`);
    }
  }
  {
    // Ask user for label for API token
    keyLabel = await ui.prompt.text({ message: "Key label" });
    if (ui.prompt.isCancel(keyLabel)) {
      await flows.manageKeys();
      return;
    }
  }

  const key: Key = {
    label: keyLabel,
    value: apiKey,
    platform: platform,
    id: uuidv4(),
  };
  // Save API token to config
  state.config.keys.push(key);

  await configTools.save();

  ui.prompt.log.success("✅ Key created!");

  if (verifiedKey && verifiedPlatform) {
    return;
  } else {
    await flows.manageKeys();
  }
}

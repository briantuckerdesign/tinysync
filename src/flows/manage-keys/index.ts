import { state } from "../../state";
import { ui } from "../../ui";
import { utils } from "../../utils/index";
import { flows } from "./../index";
import { createKey } from "./create-key";
import { manageKey } from "./manage-key";

export async function manageKeys() {
  try {
    ui.prompt.log.info(ui.format.bold("🔑 Manage keys"));

    let keysToPickFrom = state.config.keys as any;

    // create name that equals label
    // `name` prop is required for clack, otherwise we'd just use `label`
    keysToPickFrom.forEach((keyToPick) => {
      if (keyToPick.platform === "webflow") {
        keyToPick.name = `${keyToPick.label} [Webflow]`;
      }
      if (keyToPick.platform === "airtable") {
        keyToPick.name = `${keyToPick.label} [Airtable]`;
      }
    });

    let keysToSelect = utils.encapsulateObjectForSelect(keysToPickFrom);

    let createNewKey = {
      value: "createNewKey",
      label: "+ Create new key",
    };
    keysToSelect.unshift(createNewKey);
    let back = { value: "back", label: "Back" };
    keysToSelect.push(back);

    const selectedKey = await ui.prompt.select({
      message: "Select a key",
      options: keysToSelect,
    });
    if (ui.prompt.isCancel(selectedKey)) {
      await flows.mainMenu();
      return;
    }

    if (selectedKey === "createNewKey") {
      await createKey();
    } else if (selectedKey === "back") {
      await flows.mainMenu();
    } else {
      // @ts-ignore
      const key = state.config.keys.find((key) => key.id === selectedKey.id);
      if (!key) return;
      await manageKey(key);
    }
  } catch (error) {
    ui.prompt.log.error("Error managing keys.");
    process.exit(0);
  }
}

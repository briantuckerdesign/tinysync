import pack from "../../package.json";
import fs from "fs";
import { state } from "../state";
import { configTools } from ".";
import { ui } from "../ui";
import { config } from "process";

/* -------------------------------------------------------------------------- */
/*                             Config tools / Save                            */
/* -------------------------------------------------------------------------- */
/**
 * Saves the application configuration to a file after encrypting it.
 */

export async function saveConfig() {
  try {
    if (!state.config || !state.password) return;

    // If config is provided, use it rather than the state
    const encryptedConfig = await configTools.secure.encrypt(
      JSON.stringify(state.config),
      state.password
    );

    if (typeof encryptedConfig !== "object") {
      ui.prompt.log.error("Config is corrupted.");
      throw new Error();
    }

    fs.writeFileSync(
      "./src/data/config.json",
      JSON.stringify(encryptedConfig, null, 2)
    );
  } catch (error) {
    ui.prompt.log.error("Error saving config.");
    process.exit(0);
  }
}

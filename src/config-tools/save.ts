import pack from "../../package.json";
import fs from "fs";
import { state } from "../state";
import { configTools } from ".";
import { ui } from "../ui";

/* -------------------------------------------------------------------------- */
/*                             Config tools / Save                            */
/* -------------------------------------------------------------------------- */
/**
 * Saves the application configuration to a file after encrypting it.
 *
 * Note: This function encrypts the configuration data using `configTools.secure.encrypt`,
 * which is assumed to be an available utility for encryption. The 'password' from
 * the state object is used for this purpose. After encryption, the function writes
 * the encrypted data to `./src/data/config.json`. The operation is synchronous
 * as it uses `fs.writeFileSync`. Care should be taken to ensure the password
 * and encryption method are secure.
 */

export async function saveConfig() {
  try {
    if (!state.config || !state.password) return;

    // Preserves which version saved the config
    state.config.version = pack.version;

    const encryptedConfig = configTools.secure.encrypt(
      JSON.stringify(state.config),
      state.password
    );

    fs.writeFileSync(
      "./src/data/config.json",
      JSON.stringify(encryptedConfig, null, 2)
    );
  } catch (error) {
    ui.prompt.log.error("Error saving config.");
    process.exit(0);
  }
}

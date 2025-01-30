import { configTools } from "../../config-tools";
import { ui } from "../../ui";
import { createPassword } from "./create-password";
import { inputPassword } from "./input-password";

/**
 * Either prompts the user to log in, or to create a password.
 */
export async function login(devPassword?: string): Promise<void> {
  ui.prompt.log.info(ui.format.bold("🔐 Login"));

  try {
    const loadedConfig = await configTools.load();

    if (loadedConfig.encryptedData) {
      if (devPassword) {
        await inputPassword(loadedConfig, false, devPassword);
      } else {
        await inputPassword(loadedConfig);
      }
    } else {
      // If there's no encrypted config, create a password and save config
      await createPassword();
      await configTools.save();
    }

    ui.prompt.log.success(ui.format.green("Success!"));
  } catch (error) {
    ui.prompt.log.error("There was an error logging in.");
    process.exit(0);
  }
}

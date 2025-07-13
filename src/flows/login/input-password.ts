import { configTools } from "../../config-tools";
import { state } from "../../state";
import { ui } from "../../ui";
import { writeToJSONFile } from "../../toolbelt/write-to-file";

/**
 * Prompts the user to input a password and decrypts the configuration using the password.
 * If the password is incorrect, it prompts the user to try again.
 */
export async function inputPassword(
  loadedConfig: any,
  repeat = false,
  devPassword?: string
): Promise<void> {
  let password;

  if (!devPassword) {
    let message = "Enter your password:";
    if (repeat) message = "Incorrect password. Try again.";

    password = await ui.prompt.password({
      message: message,
    });
    await ui.handleCancel(password);
  } else {
    password = devPassword;
  }
  try {
    // decrypt using password
    state.config = configTools.secure.decrypt(loadedConfig, password);
    state.config = await configTools.checkCompatibility(state.config);

    state.password = password;
  } catch (error) {
    // if password incorrect, prompt user again
    await inputPassword(loadedConfig, true);
  }
  return;
}

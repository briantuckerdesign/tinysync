import { state } from "../../state";
import { ui } from "../../ui";

/**
 * Prompts the user to input a password and confirms it.
 * If the passwords don't match, prompts the user again.
 */
export async function createPassword(repeat = false): Promise<void> {
  let message = "Create a password:";
  if (repeat) message = "Passwords don't match. Try again.";

  let password = await ui.prompt.password({ message: message });

  if (ui.prompt.isCancel(password)) {
    ui.prompt.cancel("Ok then...");
    process.exit(0);
  }

  message = "Confirm password:";
  let confirmPassword = await ui.prompt.password({ message: message });

  if (ui.prompt.isCancel(confirmPassword)) {
    ui.prompt.cancel("Ok then...");
    process.exit(0);
  }

  // If passwords don't match, prompt user again
  if (password !== confirmPassword) {
    await createPassword(true);
  } else {
    // If passwords match, set password in state
    state.password = password;
    return;
  }
}

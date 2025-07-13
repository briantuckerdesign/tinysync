import { history } from "../../history";
import { state } from "../../state";
import { ui } from "../../ui";

/**
 * Prompts the user to input a password and confirms it.
 * If the passwords don't match, prompts the user again.
 */
export async function createPassword(repeat = false): Promise<boolean> {
  history.add(createPassword, [repeat], false);

  try {
    let message = "Create a password:";
    if (repeat) message = "Passwords don't match. Try again.";
    const password = (await ui.prompt.password({ message: message })) as string;
    await ui.handleCancel(password);

    message = "Confirm password:";
    const confirmPassword = await ui.prompt.password({ message: message });
    await ui.handleCancel(confirmPassword);

    // If passwords don't match, prompt user again
    if (password !== confirmPassword) {
      await createPassword(true);
    } else {
      // If passwords match, set password in state
      state.password = password;
      return true;
    }
  } catch (error) {
    ui.prompt.log.error("Error creating password.");
    history.back();
    return false;
  }
}

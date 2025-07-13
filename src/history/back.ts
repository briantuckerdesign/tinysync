import { state } from "../state";
import { mainMenu } from "../flows/main-menu";

export async function back() {
  if (state.history.length < 2) {
    await mainMenu();
    return;
  }

  const destination = state.history[state.history.length - 2];
  state.history.pop();

  if (!destination) return;

  if (destination.safeReturn) {
    await destination.function(...(destination.args || []));
  } else {
    await back();
  }
}

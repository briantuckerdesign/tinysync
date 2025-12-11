import { state } from "../state";

export async function addHistory(
  callbackFx: any,
  args: any[] = [],
  safeReturn = true
) {
  state.history.push({
    function: callbackFx,
    args: args,
    safeReturn: safeReturn,
  });
}

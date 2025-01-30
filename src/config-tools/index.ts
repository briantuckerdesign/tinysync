/* -------------------------------------------------------------------------- */
/*                                Config tools                                */
/* -------------------------------------------------------------------------- */
/**
 * Any time we manipulate the config file, we use this module.
 *
 * This ensures keys are always encrypted when saved.
 */
import { saveConfig } from "./save";
import { loadConfig } from "./load";
import { secure } from "./secure";

export const configTools: ConfigTools = {
  save: saveConfig,
  load: loadConfig,
  secure,
};

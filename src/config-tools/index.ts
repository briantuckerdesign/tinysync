/* -------------------------------------------------------------------------- */
/*                                Config tools                                */
/* -------------------------------------------------------------------------- */
/**
 * Any time we manipulate the config file, we use this module.
 *
 * This ensures tokens are always encrypted when saved.
 */
import { saveConfig } from "./save";
import { loadConfig } from "./load";
import { secure } from "./secure";
import { checkCompatibility } from "./check-compatibility";

export const configTools: ConfigTools = {
  save: saveConfig,
  load: loadConfig,
  secure,
  checkCompatibility,
};

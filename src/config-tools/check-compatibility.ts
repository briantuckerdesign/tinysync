import { configTools } from ".";
import pack from "../../package.json";

export async function checkCompatibility(config) {
  await handleKeysToTokens(config);
  return config;
}

async function handleKeysToTokens(config) {
  // versions before 0.4.0 used 'keys' instead of 'tokens'
  if (config.keys) {
    config.tokens = config.keys;
    config.version = pack.version;
    delete config.keys;
    await configTools.save();
  }
}

import fs from "fs/promises";
import { ui } from "../ui";
import { configTools } from ".";

/* -------------------------------------------------------------------------- */
/*                             Config tools / Load                            */
/* -------------------------------------------------------------------------- */
/**
 * Loads the application configuration from a JSON file.
 *
 * Note: This function attempts to read a configuration file from a specified path
 * (`./src/data/config.json`). If the file does not exist, it creates a new file with
 * an empty object as its content and then retries loading the configuration.
 * In case of other errors (not related to file non-existence), the error is thrown
 * for the caller to handle. This function is an asynchronous operation and should be
 * awaited when called.
 */

export async function loadConfig() {
  try {
    // Read the file
    const filePath = "./src/data/config.json";
    const file = await fs.readFile(filePath, "utf8");
    let config = JSON.parse(file);

    return config;
  } catch (error) {
    // If the file doesn't exist, create it.
    if (error.code === "ENOENT") {
      await fs.writeFile("./src/data/config.json", "{}", "utf8");
      // Try again
      return loadConfig();
    } else {
      ui.prompt.log.error("Error loading config.");
      process.exit(0);
    }
  }
}

import { writeFileSync } from "fs";
// This function takes destination path and data as arguments
// It should convert to JSON with space of 2 and save

// ChatGPT 4 Turbo
export function writeToJSONFile(destinationPath: string, data: any): void {
  const jsonData = JSON.stringify(data, null, 2); // Convert data to JSON with 2 spaces for indentation
  writeFileSync(destinationPath, jsonData, "utf8"); // Write JSON data to the specified file
}

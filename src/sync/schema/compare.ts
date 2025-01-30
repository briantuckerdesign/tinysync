import { ui } from "../../ui";
import { checkFieldType } from "./check-field-type";
import { updateFieldIfChanged } from "./update";

/**
 * Checks if the schema is current for the given configuration and platform.
 */
export async function compareSchemas(
  syncConfig: Sync,
  newSchema: any,
  platform: "airtable" | "webflow"
) {
  try {
    for (let field of syncConfig.fields) {
      // Skip special fields
      if (
        field.specialField === "lastPublished" ||
        field.specialField === "itemId" ||
        field.specialField === "state" ||
        field.specialField === "slug"
      ) {
        if (platform === "webflow") {
          continue;
        }
      }
      let newField = newSchema.fields.find(
        (f) => f.id === field[`${platform}Id`]
      );
      if (!newField) {
        throw new Error(`Field "${field[`${platform}Name`]}" 
 wasn't found, it may have been deleted. 
 Please re-create sync.`);
      }

      // Airtable only:
      // If the field type has changed, check if the new type is supported
      if (platform === "airtable" && field.airtable.type !== newField.type) {
        checkFieldType(newField, field);
      }

      updateFieldIfChanged(field, newField, platform, "Name");
      if (platform === "webflow") {
        updateFieldIfChanged(field, newField, platform, "Slug");
      }
    }

    return syncConfig;
  } catch (error) {
    ui.prompt.log.error(`Error checking ${platform} schema`);
    process.exit(0);
  }
}

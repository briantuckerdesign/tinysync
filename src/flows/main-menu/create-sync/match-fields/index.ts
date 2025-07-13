/* -------------------------------------------------------------------------- */
/*                         Create sync / Match fields                         */
/* -------------------------------------------------------------------------- */
/**
 *
 * Best of luck to anyone who has gotten this far. I'm sorry. Good luck.
 *
 */
import { storeExcludedFields } from "./store-excluded-fields";
import { Field } from "webflow-api/api";
import { userMatchesFields } from "./user-matches-fields";
import { ui } from "../../../../ui";
/**
 * Match Airtable fields to corresponding Webflow fields based on configuration
 * and user selection.
 *
 */
export async function matchFields(
  airtableConfig: AirtableConfig,
  webflowConfig: WebflowConfig
) {
  try {
    let matchedFields: any = [];

    // Airtable fields to match
    // Excluding: Primary Field, Slug, Last Published, State, Item ID
    const airtableFields = removeFieldsById(airtableConfig.table.fields, [
      airtableConfig.table.primaryFieldId,
      airtableConfig.stateField.id,
      airtableConfig.slugField.id,
      airtableConfig.webflowItemIdField.id,
      airtableConfig.lastPublishedField.id,
    ]) as AirtableField[];

    // Webflow fields to match
    // Excluding: Name and Slug
    const webflowFields = webflowConfig.collection.fields.filter(
      (field) => field.slug !== "slug" && field.slug !== "name"
    ) as Field[];

    // Store the excluded fields
    const specialFields = storeExcludedFields(airtableConfig, webflowConfig);
    matchedFields.push(...specialFields);

    // Match the remaining fields
    const userMatchedFields = await userMatchesFields(
      airtableFields,
      webflowFields
    );
    matchedFields.push(...userMatchedFields);

    return matchedFields.filter((field) => field !== null) as MatchedField[];
  } catch (error) {
    ui.prompt.log.error("Error matching fields.");
    process.exit(0);
  }
}

/**
 * Removes fields based on the provided field IDs.
 */
function removeFieldsById(fields: any[], ids: string[]) {
  return fields.filter((field) => !ids.includes(field.id));
}

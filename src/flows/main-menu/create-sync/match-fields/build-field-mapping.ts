/* -------------------------------------------------------------------------- */
/*                     Match fields / Build field mapping                     */
/* -------------------------------------------------------------------------- */

import { Field } from "webflow-api/api";

interface updatedField extends Field {
  validations?: any;
}
/**
 * This builds the combined field format that is used throughout the application.
 */
export function buildFieldMapping(
  airtableField: AirtableField,
  webflowField?: updatedField
): MatchedField {
  if (webflowField) {
    return {
      webflow: {
        slug: webflowField.slug,
        displayName: webflowField.displayName,
        id: webflowField.id,
        type: webflowField.type,
        validations: webflowField.validations || {},
      },
      airtable: {
        name: airtableField.name,
        id: airtableField.id,
        type: airtableField.type,
        options: airtableField.options || {},
      },
      specialField: null,
    };
  } else {
    return {
      airtable: {
        name: airtableField.name,
        id: airtableField.id,
        type: airtableField.type,
        options: airtableField.options || {},
      },
      specialField: null,
    };
  }
}

import { fieldCompatibilityMap } from '../../flows/create-sync/match-fields/get-compatible-airtable-fields'

/**
 * Checks the compatibility of a new field type with an existing field type.
 * Throws an error if the types are not compatible.
 * Updates the existing field type if the types are compatible.
 *
 * @param {Object} newField - The new field object.
 * @param {Object} existingField - The existing field object.
 * @throws {Error} Throws an error if the types are not compatible.
 */
export function checkFieldType(newField: any, existingField: MatchedField) {
    if (
        fieldCompatibilityMap[newField.type].includes(
            existingField.webflow.type
        )
    ) {
        throw new Error(
            `Airtable field "${existingField.airtable.name}" has changed type from "${existingField.airtable.type}" to "${newField.type}". This is not supported. Please re-run config.`
        )
    } else {
        // console.log(
        //     `Airtable field "${existingField.airtableName}" has changed type from" ${existingField.airtableType}" to "${newField.type}".`
        // );
        existingField.airtable.type = newField.type
    }
}

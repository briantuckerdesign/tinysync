import { fieldCompatibilityMap } from "../../flows/create-sync/match-fields/get-compatible-airtable-fields";

/**
 * Updates a field if it has changed based on the provided platform and property.
 * @param {object} field - The field object to be updated.
 * @param {object} newField - The new field object containing the updated values.
 * @param {string} platform - The platform on which the field is being updated.
 * @param {string} property - The property of the field being updated.
 */
export function updateFieldIfChanged(field, newField, platform, property) {
  const propName = `${platform}${property}`;
  const newPropName =
    platform === "webflow"
      ? property === "Name"
        ? "displayName"
        : "slug"
      : "name";
  if (field[propName] !== newField[newPropName]) {
    // console.log(
    //     `Field "${field[propName]}" has changed ${property.toLowerCase()} to "${newField[newPropName]}".`
    // );
    field[propName] = newField[newPropName];
  }
}

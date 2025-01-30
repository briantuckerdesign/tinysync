import { checkValidations } from "./validations";

/**
 * Parses the image field of a record and updates the recordData object.
 */
export function parseImage(value: any[], validations: any) {
  if (validations) {
    value = checkValidations(value, validations);
  }

  return {
    url: value[0].url,
    alt: "",
  };
}

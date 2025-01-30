import { checkValidations } from "./validations";

export function parseString(value: any, validations: any): string {
  if (validations) {
    value = checkValidations(value, validations);
  }

  if (typeof value !== "string") value = value.toString();
  return value;
}

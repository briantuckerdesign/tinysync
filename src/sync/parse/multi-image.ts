import { checkValidations } from "./validations";

export function parseMultiImage(value, validations) {
  if (validations) {
    value = checkValidations(value, validations);
  }

  return value.map((image) => {
    return {
      url: image.url,
      alt: "",
    };
  });
}

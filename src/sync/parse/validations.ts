import { parse } from ".";

export function checkValidations(
  parsedValue: any,
  validations: any,
  fetchedValue?: any
) {
  return parsedValue;
  try {
    if (validations.maxLength) {
      parsedValue = maxLength(parsedValue, validations.maxLength);
    }
    if (validations.minLength) {
      parsedValue = minLength(parsedValue, validations.minLength);
    }
    if (validations.singleLine) {
      parsedValue = singleLine(parsedValue);
    }
    if (validations.precision) {
      parsedValue = precision(parsedValue, validations.precision);
    }
    if (validations.allowNegative) {
      parsedValue = allowNegative(parsedValue);
    }

    //   if (validations.minImageSize) {
    //     parsedValue = minImageSize(
    //       parsedValue,
    //       fetchedValue,
    //       validations.minImageSize
    //     );
    //   }

    // TODO: minImageSize
    // TODO: maxImageSize
    // TODO: minImageWidth
    // TODO: maxImageWidth
    // TODO: minImageHeight
    // TODO: maxImageHeight
    // TODO: format (integer, decimal, date-time, options[{name}])
    // TODO: precision
    // TODO: allowNegative

    return parsedValue;
  } catch (error) {
    throw error;
  }
}

function maxLength(value: any, maxLength: number) {
  if (value.length > maxLength) {
    throw new Error(
      `The value for ${value} is too long. It must be less than ${maxLength} characters.`
    );
  }
  return value;
}

function minLength(value: any, minLength: number) {
  if (value.length < minLength) {
    throw new Error(
      `The value for ${value} is too short. It must be at least ${minLength} characters.`
    );
  }
  return value;
}

function singleLine(value: any) {
  if (value.includes("\n")) {
    console.warn(
      "Line breaks are not allowed in singleLine fields, replaced with spaces."
    );
    value = value.replace(/\n/g, " ");
  }
  return value;
}

function precision(value: any, precision: number) {
  if (value.toString().split(".")[1].length > precision) {
    throw new Error(
      `The value for ${value} has too many decimal places. It must have ${precision} decimal places.`
    );
  }
  return value;
}

function allowNegative(value: any) {
  if (value < 0) {
    throw new Error(
      `The value for ${value} cannot be negative. It must be a positive number.`
    );
  }
  return value;
}

function minImageSize(value: any, fetchedValue: any, minImageSize: number) {
  if (fetchedValue[0] && fetchedValue[0].size) {
    if (fetchedValue[0].size < minImageSize) {
      throw new Error(
        `The image for ${value} is too small. It must be at least ${minImageSize} pixels.`
      );
    }
  }
  return value;
}

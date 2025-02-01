export function encapsulateObjectForSelect(objects: any) {
  if (!Array.isArray(objects)) {
    throw new TypeError("Input must be an array of objects");
  }

  return objects.map((object) => {
    if (typeof object !== "object" || object === null) {
      throw new TypeError("Each item in array should be an object");
    }

    if (!object.name && !object.displayName) {
      throw new TypeError(
        "Each object must have a name or displayName property"
      );
    }

    return {
      label: object.name || object.displayName,
      value: { ...object },
    };
  });
}

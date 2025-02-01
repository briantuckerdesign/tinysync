// TODO: KEEP
/**
 * Filters an array of objects by a property path and value.
 *
 * @param {Array} data - The array of objects to filter.
 * @param {string} propertyPath - The property path to filter by.
 * @param {*} value - The value to filter by.
 * @returns {Array} - The filtered array of objects.
 */
export function filterByPropertyPath(data, propertyPath, value) {
    if (!data || !Array.isArray(data)) {
        return [];
    }

    return data.filter((item) => {
        const pathParts = propertyPath.split(".");
        let currentPropertyValue = item;
        for (let part of pathParts) {
            if (currentPropertyValue && part in currentPropertyValue) {
                currentPropertyValue = currentPropertyValue[part];
            } else {
                return false;
            }
        }
        return currentPropertyValue === value;
    });
}
// example usage:
// const filtered = filterByPropertyPath(data, "fields.Name", "test");
// would return an array of objects where the value of the Name field is "test"

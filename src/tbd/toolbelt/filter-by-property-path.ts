/**
 * Filters an array of objects by a property path and value.
 *
 * @template T - The type of objects in the array
 * @param {T[]} data - The array of objects to filter.
 * @param {string} propertyPath - The property path to filter by.
 * @param {unknown} value - The value to filter by.
 * @returns {T[]} - The filtered array of objects with the same type as input.
 */
export function filterByPropertyPath<T>(
    data: T[],
    propertyPath: string,
    value: unknown
): T[] {
    if (!data || !Array.isArray(data)) {
        return []
    }

    return data.filter((item) => {
        const pathParts = propertyPath.split('.')
        let currentPropertyValue: unknown = item
        for (let part of pathParts) {
            if (
                currentPropertyValue &&
                typeof currentPropertyValue === 'object' &&
                part in currentPropertyValue
            ) {
                currentPropertyValue = (
                    currentPropertyValue as Record<string, unknown>
                )[part]
            } else {
                return false
            }
        }
        return currentPropertyValue === value
    })
}
// example usage:
// const filtered = filterByPropertyPath(data, "fields.Name", "test");
// would return an array of objects where the value of the Name field is "test"

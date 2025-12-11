/**
 * Ensures that a string is a valid slug.
 *
 * - Allows only alphanumeric characters, hyphens, and underscores.
 * - Replaces spaces with hyphens.
 * - Removes unwanted characters.
 * - Converts to lowercase.
 *
 * Returns the modified string.
 */
export function parseSlug(value: string, parsedRecord): string {
    if (!value) value = parsedRecord.name

    // Regular expression to identify unwanted characters
    const invalidCharsRegex = /[^a-zA-Z0-9-_]/g
    const updatedValue = value
        .replace(/\s+/g, '-')
        .replace(invalidCharsRegex, '')
        .toLowerCase()
    // Replace spaces with hyphens, remove unwanted characters, and convert to lowercase
    return updatedValue
}

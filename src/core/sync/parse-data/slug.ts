/**
 * Ensures that a string is a valid slug.
 *
 * - Allows only alphanumeric characters, hyphens, and underscores.
 * - Replaces spaces with hyphens.
 * - Removes unwanted characters.
 * - Converts to lowercase.
 *
 * Falls back to the record's name field if no value is provided.
 */
export function parseSlug(
    value: string | null | undefined,
    parsedRecord: { name?: string }
): string {
    const input = value || parsedRecord.name || ''

    return input
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9-_]/g, '')
        .toLowerCase()
}

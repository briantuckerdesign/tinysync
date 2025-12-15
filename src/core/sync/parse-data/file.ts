interface AirtableAttachment {
    url: string
    filename: string
}

interface WebflowFile {
    url: string
    alt: string
}

/**
 * Parses the file field of a record.
 * Passes filename as alt.
 */
export function parseFile(value: AirtableAttachment[]): WebflowFile {
    if (!value || !value[0]) {
        throw new Error('File field is empty or invalid')
    }

    return {
        url: value[0].url,
        alt: value[0].filename,
    }
}

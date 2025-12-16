interface AirtableAttachment {
    url: string
    filename: string
}

interface WebflowImage {
    url: string
    alt: string
}

/**
 * Parses the image field of a record.
 * Passes filename as alt.
 */
export function parseImage(value: AirtableAttachment[]): WebflowImage {
    if (!value || !value[0]) {
        throw new Error('Image field is empty or invalid')
    }

    return {
        url: value[0].url,
        alt: value[0].filename,
    }
}

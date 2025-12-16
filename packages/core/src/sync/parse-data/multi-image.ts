interface AirtableAttachment {
    url: string
    filename: string
}

interface WebflowImage {
    url: string
    alt: string
}

/**
 * Parses multiple images from Airtable attachments.
 * Passes filename as alt for each image.
 */
export function parseMultiImage(value: AirtableAttachment[]): WebflowImage[] {
    if (!value || !Array.isArray(value)) {
        throw new Error('Multi-image field is empty or invalid')
    }

    return value.map((image) => ({
        url: image.url,
        alt: image.filename,
    }))
}

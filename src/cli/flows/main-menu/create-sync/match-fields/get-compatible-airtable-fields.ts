/* -------------------------------------------------------------------------- */
/*                   Match fields / Get compatible fields                     */
/* -------------------------------------------------------------------------- */
/**
 * Map of field types and their compatible data types.
 * Keys are webflow field types, values are arrays of airtable field types.
 */

// TODO: update reference in updateschema to this
export const fieldCompatibilityMap = {
    PlainText: [
        'singleLineText',
        'multilineText',
        'url',
        'email',
        'phoneNumber',
        'number',
        'currency',
        'percent',
        'autoNumber',
        'rating',
        'formula',
        'rollup',
        'lookup',
        'singleSelect',
        'multipleSelects',
        'singleCollaborator',
        'multipleCollaborators',
        'date',
        'dateTime',
        'createdTime',
        'count',
        'lookup',
        'autoNumber',
        'barcode',
        'rating',
        'duration',
        'lastModifiedTime',
        'createdBy',
        'lastModifiedBy',
        'aiText',
    ],
    RichText: ['richText', 'formula'],
    Image: ['multipleAttachments'],
    MultiImage: ['multipleAttachments'],
    VideoLink: ['singleLineText', 'url', 'formula'],
    Link: ['singleLineText', 'url', 'formula'],
    Email: ['singleLineText', 'email', 'formula'],
    Phone: ['singleLineText', 'phoneNumber', 'formula'],
    Number: [
        'singleLineText',
        'number',
        'currency',
        'percent',
        'autoNumber',
        'rating',
        'formula',
        'rollup',
        'barcode',
    ],
    DateTime: ['singleLineText', 'dateTime', 'formula'],
    Switch: ['singleLineText', 'checkbox', 'formula'],
    Color: ['singleLineText', 'formula'],
    Option: ['singleLineText', 'singleSelect', 'formula'],
    File: ['multipleAttachments'],
    Reference: ['multipleRecordLinks'],
    MultiReference: ['multipleRecordLinks'],
}

/**
 * Retrieves the compatible Airtable fields based on the given Webflow type.
 * @param {string} webflowType - The Webflow type.
 * @param {Array} airtableFields - The array of Airtable fields.
 * @returns {Promise<Array>} - The array of compatible Airtable fields.
 */
export async function getCompatibleAirtableFields(webflowType, airtableFields) {
    const compatibleTypes = fieldCompatibilityMap[webflowType] || []
    return airtableFields.filter((field) =>
        compatibleTypes.includes(field.type)
    )
}

import type { SyncField } from '../../types'
import { parseBoolean } from './boolean'
import { parseFile } from './file'
import { parseImage } from './image'
import { parseMultiImage } from './multi-image'
import { parseMultiReference, type ReferenceContext } from './multi-reference'
import { parseNumber } from './number'
import { parseOption } from './option'
import { parseReference } from './reference'
import { parseRichText } from './richtext'
import { parseString } from './string'

/**
 * Parses a field value based on its Webflow type.
 * For Reference and MultiReference fields, this requires API calls to fetch linked records.
 *
 * @param field - The sync field configuration
 * @param fetchedValue - The raw value from Airtable
 * @param referenceContext - Required for Reference/MultiReference fields
 * @returns The parsed value ready for Webflow
 */
export async function parseByFieldType(
    field: SyncField,
    fetchedValue: any,
    referenceContext?: ReferenceContext
): Promise<any> {
    const validations = field.webflow?.validations ?? {}

    switch (field.webflow?.type) {
        case 'RichText':
            return parseRichText(fetchedValue, validations)

        case 'Image':
            return parseImage(fetchedValue)

        case 'MultiImage':
            return parseMultiImage(fetchedValue)

        case 'File':
            return parseFile(fetchedValue)

        case 'Switch':
            return parseBoolean(fetchedValue)

        case 'Number':
            return parseNumber(fetchedValue, validations)

        case 'Option':
            return parseOption(fetchedValue, validations)

        case 'Reference':
            if (!referenceContext) {
                throw new Error(
                    'Reference fields require API context. Please provide token and baseId.'
                )
            }
            return parseReference(field, fetchedValue, referenceContext)

        case 'MultiReference':
            if (!referenceContext) {
                throw new Error(
                    'MultiReference fields require API context. Please provide token and baseId.'
                )
            }
            return parseMultiReference(field, fetchedValue, referenceContext)

        default:
            return parseString(fetchedValue, validations)
    }
}

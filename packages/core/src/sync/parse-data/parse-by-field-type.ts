import type { SyncField } from '../../types'
import { parseBoolean } from './boolean'
import { parseFile } from './file'
import { parseImage } from './image'
import { parseMultiImage } from './multi-image'
import { parseNumber } from './number'
import { parseOption } from './option'
import { parseRichText } from './richtext'
import { parseString } from './string'

export function parseByFieldType(field: SyncField, fetchedValue: any): any {
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

        // TODO: Reference and MultiReference support

        default:
            return parseString(fetchedValue, validations)
    }
}

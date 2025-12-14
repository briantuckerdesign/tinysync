import type { SyncField } from '../../types'
import { parseBoolean } from './boolean'
import { parseFile } from './file'
import { parseImage } from './image'
import { parseMultiImage } from './multi-image'
import { parseNumber } from './number'
import { parseOption } from './option'
import { parseRichText } from './richtext'
import { parseString } from './string'

export async function parseByFieldType(field: SyncField, fetchedValue: any) {
    let parsedValue: any
    const validations = field.webflow?.validations || {}

    switch (field.webflow?.type) {
        case 'RichText':
            parsedValue = parseRichText(fetchedValue, validations)
            break

        case 'Image':
            parsedValue = parseImage(fetchedValue, validations)
            break

        case 'MultiImage':
            parsedValue = parseMultiImage(fetchedValue, validations)
            break

        case 'File':
            parsedValue = parseFile(fetchedValue, validations)
            break

        case 'Switch':
            parsedValue = parseBoolean(fetchedValue, validations)
            break

        case 'Number':
            parsedValue = parseNumber(fetchedValue, validations)
            break
        case 'Option':
            parsedValue = parseOption(fetchedValue, validations)
            break

        // TODO: Reference support
        // case "Reference": {
        //   parsedValue = await parse.reference(
        //     field,
        //     record,
        //     parsedRecord,
        //     selectedSync
        //   );
        //   break;
        // }
        //
        // case "MultiReference":
        //   parsedValue = await parse.multiReference(
        //     field,
        //     record,
        //     parsedRecord,
        //     selectedSync
        //   );
        //   break;

        default:
            parsedValue = parseString(fetchedValue, validations)
            break
    }

    return parsedValue
}

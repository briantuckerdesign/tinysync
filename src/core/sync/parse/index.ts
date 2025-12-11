// TODO: VALIDATIONS
import { parseImage } from './image'
import { parseNumber } from './number'
import { parseRichText } from './richtext'
import { parseString } from './string'
import { parseBoolean } from './boolean'
import { parseSlug } from './slug'
import { checkValidations } from './validations'
import { parseFile } from './file'
import { parseMultiImage } from './multi-image'

export const parse = {
    string: parseString,
    boolean: parseBoolean,
    number: parseNumber,
    slug: parseSlug,
    richText: parseRichText,
    image: parseImage,
    multiImage: parseMultiImage,
    file: parseFile,
    //   reference,
    //   multiReference,
}

/**
 * This function parses an Airtable record to ensure it works with Webflow.
 * It goes field by field, and parses the value based on the type of the field.
 *
 * If there is no value for a field, it will return null to ensure that the field is empty on the Webflow side.
 */
export async function parseAirtableRecord(
    fetchedRecord: AirtableRecord,
    selectedSync: Sync
) {
    let parsedRecord: any = {}
    let parsedValue

    /** Only fields that are present in Webflow and in the config */
    const syncedFields = selectedSync.fields.filter((field) => field.webflow)

    // Loop through each synced field and parse the value to ensure it works with Webflow
    for (const syncedField of syncedFields) {
        parsedValue = null // This is needed to ensure fields that used to be filled but are now empty will be overwritten.

        const fetchedValue = fetchedRecord.fields[syncedField.airtable.id]

        if (syncedField.specialField === 'name') {
            if (!fetchedValue) {
                console.error(
                    'Name field is empty on record',
                    fetchedRecord.id,
                    syncedField.airtable.name
                )
                process.exit(1)
            }
            parsedValue = parse.string(
                fetchedValue,
                syncedField.webflow.validations
            )
        } else if (syncedField.specialField === 'slug') {
            parsedValue = parse.slug(fetchedValue, parsedRecord)
        } else if (!fetchedValue) {
            // Do nothing, it will return null, see line 31
        } else {
            parsedValue = await handleFieldBasedOnType(
                syncedField,
                fetchedValue
            )
        }

        // e.g. "myWebflowItemIdHere": "My parsed value here"
        parsedRecord[syncedField.webflow.slug] = parsedValue
    }

    return parsedRecord
}

async function handleFieldBasedOnType(
    syncedField: MatchedField,
    fetchedValue: any
) {
    let parsedValue
    const validations = syncedField.webflow.validations

    switch (syncedField.webflow.type) {
        case 'RichText':
            parsedValue = parse.richText(fetchedValue, validations)
            break

        case 'Image':
            parsedValue = parse.image(fetchedValue, validations)
            break

        case 'MultiImage':
            parsedValue = parse.multiImage(fetchedValue, validations)
            break

        case 'File':
            parsedValue = parse.file(fetchedValue, validations)
            break

        case 'Switch':
            parsedValue = parse.boolean(fetchedValue, validations)
            break

        case 'Number':
            parsedValue = parse.number(fetchedValue, validations)
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
            parsedValue = parse.string(fetchedValue, validations)
            break
    }

    return parsedValue
}

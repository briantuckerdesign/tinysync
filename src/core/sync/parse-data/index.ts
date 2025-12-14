import type { PayloadFieldData } from 'webflow-api/api'
import type { AirtableRecord } from '../../airtable/types'
import type { Sync } from '../../types'
import { parseSlug } from './slug'
import { parseString } from './string'
import { parseByFieldType } from './parse-by-field-type'

export async function parseAirtableRecord(
    fetchedRecord: AirtableRecord,
    sync: Sync
): Promise<PayloadFieldData | null> {
    try {
        let parsedRecord: any = {}
        let parsedValue

        /** Only fields that are present in Webflow and in the config */
        const syncedFields = sync.fields.filter((field) => field.webflow)

        // Loop through each synced field and parse the value to ensure it works with Webflow
        for (const field of syncedFields) {
            /**
             * Important: we give all fields a starting null value.
             *
             * If no value is passed to Webflow, the field will retain its initial value.
             * This creates a case where one can clear field in Airtable but not clear the field in Webflow.
             */
            parsedValue = null

            const fetchedValue = fetchedRecord.fields[field.airtable.id]

            if (field.specialField === 'name') {
                if (!fetchedValue)
                    throw new Error(
                        `Name field is empty on record: ${fetchedRecord.id} for field ${field.airtable.name}`
                    )

                const validations = field.webflow?.validations || {}

                parsedValue = parseString(fetchedValue, validations)
            } else if (field.specialField === 'slug') {
                parsedValue = parseSlug(fetchedValue, parsedRecord)
            } else if (!fetchedValue) {
                // It will return null, no action taken.
            } else {
                parsedValue = await parseByFieldType(field, fetchedValue)
            }

            // e.g. "webflow field slug here": "My parsed value here"
            parsedRecord[field.webflow?.slug as string] = parsedValue
        }
        return parsedRecord as PayloadFieldData
    } catch (error) {
        console.error(
            'Skipping record ',
            fetchedRecord.id,
            (error as any).message ? (error as any).message : error
        )
        return null
    }
}

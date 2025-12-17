import type { CollectionItem, PayloadFieldData } from 'webflow-api/api'
import type { AirtableRecord } from '../../airtable/types'
import type { RecordWithErrors, Sync } from '../../types'
import { parseSlug } from './slug'
import { parseString } from './string'
import { parseByFieldType } from './parse-by-field-type'
import type { ReferenceContext } from './reference'

// Re-export for convenience
export type { ReferenceContext } from './reference'

export type ParsedRecord = {
    record: AirtableRecord
    collectionItem: CollectionItem
}

export type ParseAirtableRecordsResult = {
    parsedRecords: ParsedRecord[]
    recordsWithParsingErrors: RecordWithErrors[]
}

/**
 * Parses all Airtable records into Webflow collection items.
 * For syncs with Reference/MultiReference fields, this makes API calls
 * to resolve linked record IDs to Webflow item IDs.
 *
 * @param records - Airtable records to parse
 * @param sync - Sync configuration
 * @param referenceContext - Required if sync has Reference/MultiReference fields
 */
export async function parseAirtableRecords(
    records: AirtableRecord[],
    sync: Sync,
    referenceContext?: ReferenceContext
): Promise<ParseAirtableRecordsResult> {
    const parsedRecords: ParsedRecord[] = []
    const recordsWithParsingErrors: RecordWithErrors[] = []

    for (const record of records) {
        const parsedRecord = await parseAirtableRecord(
            record,
            sync,
            referenceContext
        )
        // If failed, push to recordsWithErrors
        if (!parsedRecord.success) {
            recordsWithParsingErrors.push(parsedRecord.error)
            continue
        }
        // If success, push for creation
        parsedRecords.push({
            record,
            collectionItem: {
                isArchived: false,
                isDraft: false,
                fieldData: parsedRecord.data,
            },
        })
    }

    return {
        parsedRecords,
        recordsWithParsingErrors,
    }
}

export type ParseResult =
    | { success: true; data: PayloadFieldData }
    | { success: false; error: RecordWithErrors }

/**
 * Parses a single Airtable record into Webflow field data.
 *
 * @param fetchedRecord - The Airtable record to parse
 * @param sync - Sync configuration
 * @param referenceContext - Required if sync has Reference/MultiReference fields
 */
export async function parseAirtableRecord(
    fetchedRecord: AirtableRecord,
    sync: Sync,
    referenceContext?: ReferenceContext
): Promise<ParseResult> {
    const parsedRecord: Record<string, any> = {}
    const errors: string[] = []

    const syncedFields = sync.fields.filter((field) => field.webflow)

    for (const field of syncedFields) {
        const fieldName = field.airtable.name
        const webflowSlug = field.webflow?.slug

        if (!webflowSlug) continue

        /**
         * Important: we give all fields a starting null value.
         * If no value is passed to Webflow, the field will retain its initial value.
         * This creates a case where one can clear a field in Airtable but not in Webflow.
         */
        let parsedValue: any = null

        const fetchedValue = fetchedRecord.fields[field.airtable.id]

        try {
            if (field.specialField === 'name') {
                if (!fetchedValue) {
                    throw new Error('Name field cannot be empty')
                }
                const validations = field.webflow?.validations ?? {}
                parsedValue = parseString(fetchedValue, validations)
            } else if (field.specialField === 'slug') {
                parsedValue = parseSlug(fetchedValue, parsedRecord)
            } else if (fetchedValue != null) {
                parsedValue = await parseByFieldType(
                    field,
                    fetchedValue,
                    referenceContext
                )
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err)
            errors.push(`[${fieldName}]: ${message}`)
        }

        parsedRecord[webflowSlug] = parsedValue
    }

    if (errors.length > 0) {
        return {
            success: false,
            error: { record: fetchedRecord, errors },
        }
    }

    return {
        success: true,
        data: parsedRecord as PayloadFieldData,
    }
}

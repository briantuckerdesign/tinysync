import type { CollectionItem, PayloadFieldData } from 'webflow-api/api'
import type { AirtableRecord } from '../../airtable/types'
import type { RecordWithErrors, Sync } from '../../types'
import { parseSlug } from './slug'
import { parseString } from './string'
import { parseByFieldType } from './parse-by-field-type'

export type ParsedRecord = {
    record: AirtableRecord
    collectionItem: CollectionItem
}

export type RarseAirtableRecordsResult = {
    parsedRecords: ParsedRecord[]
    recordsWithParsingErrors: RecordWithErrors[]
}

export function parseAirtableRecords(
    records: AirtableRecord[],
    sync: Sync
): RarseAirtableRecordsResult {
    const parsedRecords: ParsedRecord[] = []
    const recordsWithParsingErrors: RecordWithErrors[] = []
    for (const record of records) {
        const parsedRecord = parseAirtableRecord(record, sync)
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

export function parseAirtableRecord(
    fetchedRecord: AirtableRecord,
    sync: Sync
): ParseResult {
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
                parsedValue = parseByFieldType(field, fetchedValue)
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

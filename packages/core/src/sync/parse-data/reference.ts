import type { SyncField } from '../../types'
import { airtable } from '../../airtable'

export interface ReferenceContext {
    /** Airtable API token */
    token: string
    /** Airtable base ID */
    baseId: string
}

/**
 * Parses a single Reference field by looking up the linked Airtable record
 * and extracting the Webflow item ID from the configured field.
 *
 * @param field - The sync field configuration
 * @param fetchedValue - Array of linked Airtable record IDs (typically just one for Reference)
 * @param context - Token and base ID for API calls
 * @returns The Webflow item ID string, or null if not found
 */
export async function parseReference(
    field: SyncField,
    fetchedValue: string[],
    context: ReferenceContext
): Promise<string | null> {
    // Reference fields return an array of record IDs, even for single reference
    if (
        !fetchedValue ||
        !Array.isArray(fetchedValue) ||
        fetchedValue.length === 0
    ) {
        return null
    }

    const referenceConfig = field.referenceConfig
    if (!referenceConfig) {
        throw new Error(
            `Reference field "${field.airtable.name}" is missing referenceConfig. ` +
                `Please reconfigure this sync.`
        )
    }

    // For Reference (not MultiReference), we only use the first linked record
    const linkedRecordId = fetchedValue[0]
    if (!linkedRecordId) {
        return null
    }

    try {
        // Fetch the linked record from the linked table
        const linkedRecord = await airtable.get.record(
            context.token,
            context.baseId,
            referenceConfig.linkedTableId,
            linkedRecordId
        )

        // Extract the Webflow item ID from the configured field
        const webflowItemId =
            linkedRecord.fields[referenceConfig.linkedItemIdFieldId]

        if (!webflowItemId || typeof webflowItemId !== 'string') {
            throw new Error(
                `Referenced record "${linkedRecordId}" does not have a Webflow item ID. ` +
                    `Make sure to sync the referenced collection first.`
            )
        }

        return webflowItemId
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error(`Failed to resolve reference: ${String(error)}`)
    }
}

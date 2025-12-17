import type { SyncField } from '../../types'
import { airtable } from '../../airtable'

export interface ReferenceContext {
    /** Airtable API token */
    token: string
    /** Airtable base ID */
    baseId: string
}

/**
 * Parses a MultiReference field by looking up all linked Airtable records
 * and extracting their Webflow item IDs from the configured field.
 *
 * @param field - The sync field configuration
 * @param fetchedValue - Array of linked Airtable record IDs
 * @param context - Token and base ID for API calls
 * @returns Array of Webflow item ID strings
 */
export async function parseMultiReference(
    field: SyncField,
    fetchedValue: string[],
    context: ReferenceContext
): Promise<string[]> {
    // MultiReference fields return an array of record IDs
    if (
        !fetchedValue ||
        !Array.isArray(fetchedValue) ||
        fetchedValue.length === 0
    ) {
        return []
    }

    const referenceConfig = field.referenceConfig
    if (!referenceConfig) {
        throw new Error(
            `MultiReference field "${field.airtable.name}" is missing referenceConfig. ` +
                `Please reconfigure this sync.`
        )
    }

    const webflowItemIds: string[] = []
    const errors: string[] = []

    // Fetch each linked record and extract the Webflow item ID
    for (const linkedRecordId of fetchedValue) {
        try {
            const linkedRecord = await airtable.get.record(
                context.token,
                context.baseId,
                referenceConfig.linkedTableId,
                linkedRecordId
            )

            const webflowItemId =
                linkedRecord.fields[referenceConfig.linkedItemIdFieldId]

            if (!webflowItemId || typeof webflowItemId !== 'string') {
                errors.push(
                    `Referenced record "${linkedRecordId}" does not have a Webflow item ID`
                )
                continue
            }

            webflowItemIds.push(webflowItemId)
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error)
            errors.push(
                `Failed to resolve reference "${linkedRecordId}": ${message}`
            )
        }
    }

    // If some references failed but we have at least some valid ones, continue
    // If ALL references failed, throw an error
    if (webflowItemIds.length === 0 && errors.length > 0) {
        throw new Error(
            `Failed to resolve any references. ` +
                `Make sure to sync the referenced collection first. ` +
                `Errors: ${errors.join('; ')}`
        )
    }

    // If some references failed, we could log a warning here
    // but we'll continue with the valid ones

    return webflowItemIds
}

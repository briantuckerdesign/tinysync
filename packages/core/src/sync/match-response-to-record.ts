import type { CollectionItem, CollectionItemList } from 'webflow-api/api'
import type { ParsedRecord } from './parse-data'

export interface MatchedItem extends ParsedRecord {
    itemId: string
    slug: string
}

/**
 * Creates a MatchedItem from a ParsedRecord and a CollectionItem
 */
function createMatchedItem(
    record: ParsedRecord,
    item: CollectionItem
): MatchedItem | null {
    if (!item.id) return null
    return {
        record: record.record,
        collectionItem: record.collectionItem,
        itemId: item.id,
        slug: item.fieldData?.slug ?? '',
    }
}

/**
 * Matches Webflow API response items to the original parsed records.
 *
 * This function handles the case where Webflow may not return items in the
 * same order they were submitted. It uses a multi-pass matching strategy:
 *
 * 1. **Exact ID match** (for updates): If the parsed record has an ID, match by ID
 * 2. **Exact slug match**: Match by exact slug (handles most cases)
 * 3. **Slug prefix match**: Handle Webflow's auto-renaming of duplicate slugs
 *    (e.g., "my-slug" -> "my-slug-a1b2")
 * 4. **Name + field data match**: For duplicate names, compare additional field values
 *
 * @param batch - The parsed records that were submitted to Webflow
 * @param itemList - The response from Webflow's API
 * @returns Array of matched items with their Webflow IDs and slugs
 */
export function matchResponseToRecord(
    batch: ParsedRecord[],
    itemList: CollectionItemList
): MatchedItem[] {
    if (!itemList.items || itemList.items.length === 0) return []

    const matchedItems: MatchedItem[] = []
    const unmatchedRecords = [...batch]
    const unmatchedItems = [...itemList.items]

    // Pass 1: Exact ID match (for updates where we already have an ID)
    matchByExactId(unmatchedRecords, unmatchedItems, matchedItems)

    // Pass 2: Exact slug match
    matchByExactSlug(unmatchedRecords, unmatchedItems, matchedItems)

    // Pass 3: Slug prefix match (handles Webflow's duplicate slug renaming)
    matchBySlugPrefix(unmatchedRecords, unmatchedItems, matchedItems)

    // Pass 4: Name + additional field data match
    matchByNameAndFields(unmatchedRecords, unmatchedItems, matchedItems)

    // Pass 5: Last resort - if only one record and one item remain, match them
    if (unmatchedRecords.length === 1 && unmatchedItems.length === 1) {
        const record = unmatchedRecords[0]
        const item = unmatchedItems[0]
        if (record && item) {
            const matched = createMatchedItem(record, item)
            if (matched) {
                matchedItems.push(matched)
            }
        }
    }

    return matchedItems
}

/**
 * Match by exact ID (for update operations where record already has an ID)
 */
function matchByExactId(
    unmatchedRecords: ParsedRecord[],
    unmatchedItems: CollectionItem[],
    matchedItems: MatchedItem[]
): void {
    for (let i = unmatchedRecords.length - 1; i >= 0; i--) {
        const record = unmatchedRecords[i]
        if (!record) continue

        const recordId = record.collectionItem.id
        if (!recordId) continue

        const itemIndex = unmatchedItems.findIndex(
            (item) => item.id === recordId
        )

        if (itemIndex !== -1) {
            const item = unmatchedItems[itemIndex]
            if (!item) continue

            const matched = createMatchedItem(record, item)
            if (matched) {
                matchedItems.push(matched)
                unmatchedRecords.splice(i, 1)
                unmatchedItems.splice(itemIndex, 1)
            }
        }
    }
}

/**
 * Match by exact slug
 */
function matchByExactSlug(
    unmatchedRecords: ParsedRecord[],
    unmatchedItems: CollectionItem[],
    matchedItems: MatchedItem[]
): void {
    for (let i = unmatchedRecords.length - 1; i >= 0; i--) {
        const record = unmatchedRecords[i]
        if (!record) continue

        const recordSlug = record.collectionItem.fieldData?.slug
        if (!recordSlug) continue

        // Find items with exact slug match
        const matchingItemIndices = unmatchedItems
            .map((item, index) =>
                item.fieldData?.slug === recordSlug ? index : -1
            )
            .filter((index) => index !== -1)

        // Only use exact match if there's exactly one match (no duplicates)
        if (matchingItemIndices.length === 1) {
            const itemIndex = matchingItemIndices[0]
            if (itemIndex === undefined) continue

            const item = unmatchedItems[itemIndex]
            if (!item) continue

            const matched = createMatchedItem(record, item)
            if (matched) {
                matchedItems.push(matched)
                unmatchedRecords.splice(i, 1)
                unmatchedItems.splice(itemIndex, 1)
            }
        }
    }
}

/**
 * Match by slug prefix (handles Webflow's auto-rename of duplicate slugs)
 * Webflow appends a random 4-char suffix like "-a1b2" to duplicate slugs
 */
function matchBySlugPrefix(
    unmatchedRecords: ParsedRecord[],
    unmatchedItems: CollectionItem[],
    matchedItems: MatchedItem[]
): void {
    // Pattern: original-slug-xxxx where xxxx is 4 alphanumeric chars
    const slugSuffixPattern = /^(.+)-[a-z0-9]{4}$/i

    for (let i = unmatchedRecords.length - 1; i >= 0; i--) {
        const record = unmatchedRecords[i]
        if (!record) continue

        const recordSlug = record.collectionItem.fieldData?.slug
        const recordName = record.collectionItem.fieldData?.name

        if (!recordSlug) continue

        // Find items where slug starts with our slug and has the suffix pattern
        const candidateItems = unmatchedItems
            .map((item, index) => {
                const itemSlug = item.fieldData?.slug
                if (!itemSlug) return null

                // Check if item slug is our slug with a suffix
                const match = itemSlug.match(slugSuffixPattern)
                if (match && match[1] === recordSlug) {
                    return { index, item, score: 0 }
                }
                return null
            })
            .filter(
                (
                    candidate
                ): candidate is {
                    index: number
                    item: CollectionItem
                    score: number
                } => candidate !== null
            )

        if (candidateItems.length === 0) continue

        // If multiple candidates, score them by matching additional fields
        if (candidateItems.length > 1 && recordName) {
            for (const candidate of candidateItems) {
                candidate.score = scoreFieldMatch(record, candidate.item)
            }
            // Sort by score descending
            candidateItems.sort((a, b) => b.score - a.score)
        }

        // Take the best match
        const bestMatch = candidateItems[0]
        if (!bestMatch) continue

        const matched = createMatchedItem(record, bestMatch.item)
        if (matched) {
            matchedItems.push(matched)
            unmatchedRecords.splice(i, 1)
            unmatchedItems.splice(bestMatch.index, 1)
        }
    }
}

/**
 * Match by name and additional field data (for duplicate names/slugs)
 */
function matchByNameAndFields(
    unmatchedRecords: ParsedRecord[],
    unmatchedItems: CollectionItem[],
    matchedItems: MatchedItem[]
): void {
    for (let i = unmatchedRecords.length - 1; i >= 0; i--) {
        const record = unmatchedRecords[i]
        if (!record) continue

        const recordName = record.collectionItem.fieldData?.name
        if (!recordName) continue

        // Find items with matching name
        const candidateItems = unmatchedItems
            .map((item, index) => {
                if (item.fieldData?.name !== recordName) return null
                return {
                    index,
                    item,
                    score: scoreFieldMatch(record, item),
                }
            })
            .filter(
                (
                    candidate
                ): candidate is {
                    index: number
                    item: CollectionItem
                    score: number
                } => candidate !== null
            )

        if (candidateItems.length === 0) continue

        // Sort by score descending and take best match
        candidateItems.sort((a, b) => b.score - a.score)
        const bestMatch = candidateItems[0]
        if (!bestMatch) continue

        // Only accept if we have a reasonable confidence (score > 0)
        // or if there's only one candidate
        if (candidateItems.length === 1 || bestMatch.score > 0) {
            const matched = createMatchedItem(record, bestMatch.item)
            if (matched) {
                matchedItems.push(matched)
                unmatchedRecords.splice(i, 1)
                unmatchedItems.splice(bestMatch.index, 1)
            }
        }
    }
}

/**
 * Score how well a Webflow item's field data matches a parsed record.
 * Higher score = better match.
 */
function scoreFieldMatch(record: ParsedRecord, item: CollectionItem): number {
    let score = 0
    const recordData = record.collectionItem.fieldData ?? {}
    const itemData = item.fieldData ?? {}

    // Compare all fields in the record's fieldData
    for (const [key, recordValue] of Object.entries(recordData)) {
        // Skip slug and name as they're already handled
        if (key === 'slug' || key === 'name') continue

        const itemValue = itemData[key]

        if (recordValue === undefined || recordValue === null) continue

        // Direct equality check
        if (areValuesEqual(recordValue, itemValue)) {
            score += 1
        }
    }

    return score
}

/**
 * Compare two values for equality, handling various types
 */
function areValuesEqual(a: unknown, b: unknown): boolean {
    // Handle null/undefined
    if (a === null || a === undefined) return b === null || b === undefined
    if (b === null || b === undefined) return false

    // Primitive comparison
    if (typeof a !== 'object' || typeof b !== 'object') {
        return a === b
    }

    // Array comparison
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false
        return a.every((val, idx) => areValuesEqual(val, b[idx]))
    }

    // Object comparison (shallow)
    if (typeof a === 'object' && typeof b === 'object') {
        const aKeys = Object.keys(a as object)
        const bKeys = Object.keys(b as object)
        if (aKeys.length !== bKeys.length) return false
        return aKeys.every((key) =>
            areValuesEqual(
                (a as Record<string, unknown>)[key],
                (b as Record<string, unknown>)[key]
            )
        )
    }

    return false
}

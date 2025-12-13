import type { AirtableField } from '../../../../../../core/airtable/types'

export function sortFieldsByMatch(
    targetName: string,
    fields: Array<{ label: string; value: AirtableField }>
): Array<{ label: string; value: AirtableField }> {
    const normalizedTarget = targetName.toLowerCase().trim()

    return fields.sort((a, b) => {
        const aLabel = a.label.toLowerCase().trim()
        const bLabel = b.label.toLowerCase().trim()

        // Exact match gets highest priority
        const aExactMatch = aLabel === normalizedTarget ? 1 : 0
        const bExactMatch = bLabel === normalizedTarget ? 1 : 0
        if (aExactMatch !== bExactMatch) {
            return bExactMatch - aExactMatch
        }

        // Contains match (field contains target)
        const aContains = aLabel.includes(normalizedTarget) ? 1 : 0
        const bContains = bLabel.includes(normalizedTarget) ? 1 : 0
        if (aContains !== bContains) {
            return bContains - aContains
        }

        // Reverse contains (target contains field)
        const aReverseContains = normalizedTarget.includes(aLabel) ? 1 : 0
        const bReverseContains = normalizedTarget.includes(bLabel) ? 1 : 0
        if (aReverseContains !== bReverseContains) {
            return bReverseContains - aReverseContains
        }

        // Calculate simple similarity score based on common words
        const getWords = (str: string) =>
            str.split(/[\s_-]+/).filter((w) => w.length > 0)
        const targetWords = new Set(getWords(normalizedTarget))
        const aWords = getWords(aLabel)
        const bWords = getWords(bLabel)

        const aCommonWords = aWords.filter((w) => targetWords.has(w)).length
        const bCommonWords = bWords.filter((w) => targetWords.has(w)).length

        if (aCommonWords !== bCommonWords) {
            return bCommonWords - aCommonWords
        }

        // Keep original order if no clear winner
        return 0
    })
}

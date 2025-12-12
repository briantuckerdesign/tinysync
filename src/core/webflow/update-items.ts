import type { CollectionItem, PayloadFieldData } from 'webflow-api/api'

interface UpdateItemPayload {
    id: string
    fieldData: PayloadFieldData
    isArchived?: boolean
    isDraft?: boolean
}

const BATCH_SIZE = 100

export async function updateItems(
    token: string,
    collectionId: string,
    items: UpdateItemPayload[]
): Promise<CollectionItem[]> {
    const baseUrl = `https://api.webflow.com/v2/collections/${collectionId}/items`
    const allUpdatedItems: CollectionItem[] = []

    try {
        for (let i = 0; i < items.length; i += BATCH_SIZE) {
            const batch = items.slice(i, i + BATCH_SIZE)

            const body = {
                items: batch.map((item) => ({
                    id: item.id,
                    isArchived: item.isArchived ?? false,
                    isDraft: item.isDraft ?? false,
                    fieldData: item.fieldData,
                })),
            }

            const response = await fetch(baseUrl, {
                method: 'PATCH',
                headers: {
                    accept: 'application/json',
                    authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            if (!response.ok) throw new Error(`HTTP error: ${response.status}`)

            const data = (await response.json()) as { items?: CollectionItem[] }

            if (!data.items || data.items.length === 0) {
                throw new Error('No items returned from update')
            }

            allUpdatedItems.push(...data.items)
        }

        return allUpdatedItems
    } catch (error) {
        throw error
    }
}

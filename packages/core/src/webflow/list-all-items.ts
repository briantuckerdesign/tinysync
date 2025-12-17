import type { WebflowClient } from 'webflow-api'
import type { CollectionItem, CollectionItemList } from 'webflow-api/api'

const MAX_LIMIT = 100

/**
 * Fetches all items from a Webflow collection, handling pagination automatically.
 * The Webflow API returns a maximum of 100 items per request, so this function
 * makes multiple requests as needed to retrieve all items.
 *
 * @param webflowClient - The initialized Webflow client
 * @param collectionId - The ID of the collection to fetch items from
 * @returns A CollectionItemList with all items from the collection
 */
export async function listAllItems(
    webflowClient: WebflowClient,
    collectionId: string
): Promise<CollectionItemList> {
    const allItems: CollectionItem[] = []
    let offset = 0
    let total: number | undefined

    do {
        const response = await webflowClient.collections.items.listItems(
            collectionId,
            {
                offset,
                limit: MAX_LIMIT,
            }
        )

        if (response.items) {
            allItems.push(...response.items)
        }

        // Get total from first response
        if (total === undefined) {
            total = response.pagination?.total ?? 0
        }

        offset += MAX_LIMIT
    } while (offset < (total ?? 0))

    return {
        items: allItems,
        pagination: {
            limit: total,
            offset: 0,
            total,
        },
    }
}

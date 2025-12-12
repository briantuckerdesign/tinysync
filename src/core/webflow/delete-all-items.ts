import { deleteItems } from './delete-items'
import { getItems } from './get-items'

export async function deleteAllItems(
    token: string,
    collectionId: string
): Promise<boolean> {
    try {
        const itemIds: string[] = []
        const items = await getItems(token, collectionId)

        items.forEach((item) => {
            if (item.id) itemIds.push(item.id)
        })

        try {
            const deleted = await deleteItems(token, collectionId, itemIds)
            return deleted
        } catch (error) {
            throw error
        }
    } catch (error) {
        throw error
    }
}

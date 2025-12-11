import { ui } from '../ui'
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
            ui.prompt.log.error('Error deleting all items.')
            throw error
        }
    } catch (error) {
        ui.prompt.log.error('Error deleting all items.')
        throw error
    }
}

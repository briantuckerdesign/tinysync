import { ui } from '../../ui'

export async function deleteItem(
    token: string,
    collectionId: string,
    itemId: string
): Promise<boolean> {
    const url = `https://api.webflow.com/v2/collections/${collectionId}/items/${itemId}`
    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })

        if (!response.ok && response.status !== 204) {
            const errorText = await response.text()
            throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
            )
        }

        if (response.status === 204) return true

        return false
    } catch (error) {
        ui.prompt.log.error('Error deleting item.')
        throw error
    }
}

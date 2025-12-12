export async function deleteItems(
    token: string,
    collectionId: string,
    itemIds: string[]
): Promise<boolean> {
    const url = `https://api.webflow.com/beta/collections/${collectionId}/items`
    try {
        const options = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                items: itemIds,
            }),
        }
        const response = await fetch(url, options)

        if (!response.ok && response.status !== 204) {
            const errorText = await response.text()
            throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
            )
        }

        if (response.status === 204) return true
        return false
    } catch (error) {
        throw error
    }
}

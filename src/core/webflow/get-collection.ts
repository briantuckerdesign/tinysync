import type { Collection } from 'webflow-api/api'

export async function getCollection(
    token: string,
    collectionId: string
): Promise<Collection> {
    const url = `https://api.webflow.com/v2/collections/${collectionId}`
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok && response.status !== 200) {
            const errorText = await response.text()
            throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
            )
        }

        const data = await response.json()

        return data as Collection
    } catch (error) {
        throw error
    }
}

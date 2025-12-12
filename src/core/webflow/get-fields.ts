import type { Field } from 'webflow-api/api'
export async function getFields(
    token: string,
    collectionId: string
): Promise<Field[]> {
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

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
            )
        }

        const data: any = await response.json()

        const fields: Field[] = data.fields

        return fields
    } catch (error) {
        throw error
    }
}

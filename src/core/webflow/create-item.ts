import type { PayloadFieldData } from 'webflow-api/api'
import type { WebflowCreateItemResponse } from './types'
import { ui } from '../../ui'

export async function createItem(
    token: string,
    collectionId: string,
    fieldData: PayloadFieldData
): Promise<WebflowCreateItemResponse> {
    const url = `https://api.webflow.com/v2/collections/${collectionId}/items/bulk`
    try {
        const body = {
            isArchived: false,
            isDraft: false,
            fieldData: { ...fieldData },
        }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        }

        const response = await fetch(url, options)

        if (!response.ok || response.status != 202) {
            const errorText = await response.text()

            throw new Error(
                `HTTP error! status: ${response.status}, message: ${errorText}`
            )
        }
        const item = await response.json()

        return item as WebflowCreateItemResponse
    } catch (error) {
        ui.prompt.log.error('Error creating item.')
        throw error
    }
}

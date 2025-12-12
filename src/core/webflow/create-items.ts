import type { PayloadFieldData } from 'webflow-api/api'
import { createItem } from './create-item'
import type {
    FailedWebflowItemCreate,
    WebflowCreateItemResponse,
} from './types'

/** TODO: Attempt to refactor this to work with the bulk endpoint, which I've previously failed at. */
export async function createItems(
    token: string,
    collectionId: string,
    fieldDataArray: PayloadFieldData[]
) {
    try {
        const createdItems: WebflowCreateItemResponse[] = []
        const failedItems: FailedWebflowItemCreate[] = []

        for (const fieldData of fieldDataArray) {
            try {
                const item = await createItem(token, collectionId, fieldData)
                createdItems.push(item)
            } catch (error) {
                failedItems.push({ fieldData, error })
            }
        }
    } catch (error) {
        throw error
    }
}

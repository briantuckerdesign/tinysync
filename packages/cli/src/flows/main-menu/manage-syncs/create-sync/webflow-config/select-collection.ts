import type { WebflowClient } from 'webflow-api'
import type { Collection, CollectionListArrayItem } from 'webflow-api/api'
import { manageSyncs } from '../..'
import { ui } from '../../../../../ui'

export async function selectCollection(
    webflowClient: WebflowClient,
    siteId: string
): Promise<Collection> {
    try {
        ui.spinner.start('Getting collections...')
        // Return collections for selected site
        const collections = await webflowClient.collections.list(siteId)
        ui.spinner.stop(`✅ ${ui.format.dim('Collections retrieved.')}`)
        if (!collections.collections) throw new Error('No collections found.')

        // Ask user to select a collection
        const collectionListArrayItem = (await ui.prompt.select({
            message: 'Webflow collection:',
            options: collections.collections.map((collection) => ({
                label: collection.displayName
                    ? collection.displayName
                    : collection.id,
                value: collection,
            })),
        })) as CollectionListArrayItem
        await ui.handleCancel(collectionListArrayItem, manageSyncs)

        // Get collection details, including fields
        const collection = await webflowClient.collections.get(
            collectionListArrayItem.id
        )
        if (!collection) throw new Error('No collection found.')

        return collection
    } catch (error) {
        throw new Error('There was a problem selecting Webflow site.')
    }
}

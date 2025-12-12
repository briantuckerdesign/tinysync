import { deleteAllItems } from './delete-all-items'
import { deleteItem } from './delete-item'
import { getCollection } from './get-collection'
import { getCollections } from './get-collections'
import { getFields } from './get-fields'
import { getItems } from './get-items'
import { getSites } from './get-sites'
import { publishItem } from './publish-item'
import { publishItems } from './publish-items'
import { createItem } from './create-item'
import { createItems } from './create-items'
import { updateItems } from './update-items'
import { deleteItems } from './delete-items'
import { publishSite } from './publish-site'

export const webflow = {
    delete: {
        item: deleteItem,
        items: deleteItems,
        allItems: deleteAllItems,
    },
    create: {
        item: createItem,
        items: createItems,
    },
    publish: {
        item: publishItem,
        items: publishItems,
        site: publishSite,
    },
    update: {
        items: updateItems,
    },
    get: {
        collection: getCollection,
        collections: getCollections,
        fields: getFields,
        sites: getSites,
        items: getItems,
    },
}

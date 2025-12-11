/* -------------------------------------------------------------------------- */
/*                                    Sync                                    */
/* -------------------------------------------------------------------------- */
import { createItems } from './create-items'
import { updateItems } from './update-items'
import { publishItems } from './publish-items'
import { deleteItems } from './delete-items'
import { runSync } from './run-sync'
import { deleteSync } from './delete-sync'
import { publishWebflowSite } from './publish-site'
import { viewSyncDetails } from '../flows/main-menu/view-syncs/view-sync/view-sync-details'

export const sync = {
    createItems,
    updateItems,
    publishItems,
    deleteItems,
    delete: deleteSync,
    run: runSync,
    publish: publishWebflowSite,
    viewDetails: viewSyncDetails,
}

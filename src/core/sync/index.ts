/* -------------------------------------------------------------------------- */
/*                                    Sync                                    */
/* -------------------------------------------------------------------------- */
import { createItems } from './create-items'
import { updateItems } from './update-items'
import { publishItems } from './publish-items'
import { deleteItems } from './delete-items'
import { runSync } from './run-sync'
import { deleteSync } from './delete-sync'

export const sync = {
    createItems,
    updateItems,
    publishItems,
    deleteItems,
    delete: deleteSync,
    run: runSync,
    // viewDetails: viewSyncDetails,
}

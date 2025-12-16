import { manageSyncs } from '..'
import { ui } from '../../../../ui'
import { sanitizeString } from '../../../../utils/sanitize-string'

export async function getSyncName(): Promise<string> {
    // Ask for sync name
    const syncNameUnsanitized = (await ui.prompt.text({
        message: 'What would you like to name this sync?',
    })) as string
    await ui.handleCancel(syncNameUnsanitized, manageSyncs)

    if (!syncNameUnsanitized) {
        ui.prompt.log.error('Please provide a name')
        return await getSyncName()
    }

    return sanitizeString(syncNameUnsanitized)
}

import { history } from '../history'
import { ui } from '../ui'

/**
 * If user cancels a prompt, performs the appropriate action
 *
 * Can send a message, route to a destination function
 * If no destination is provided, will route to outro
 *
 * @param {any} sourcePrompt - The prompt source of the cancel action
 */
export async function handleCancel(sourcePrompt: any) {
    try {
        if (ui.prompt.isCancel(sourcePrompt)) await history.back()
    } catch (error) {
        ui.prompt.log.error('Error handling cancel action.')
        process.exit(0)
    }
}

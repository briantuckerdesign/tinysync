import { ui } from '../../../ui'
import { renameToken } from './rename-tokens'
import { deleteKey } from './delete-tokens'
import { manageTokens } from '.'

export async function manageToken(selectedToken) {
    try {
        const selectedAction = await ui.prompt.select({
            message: 'What would you like to do?',
            options: [
                { value: 'renameToken', label: 'Rename token' },
                { value: 'deleteToken', label: 'Delete token' },
                { value: 'back', label: 'Back' },
            ],
        })
        if (ui.prompt.isCancel(selectedAction)) {
            await manageTokens()
            return
        }

        switch (selectedAction) {
            case 'renameToken':
                await renameToken(selectedToken)
                break
            case 'deleteToken':
                await deleteKey(selectedToken)
                break
            default:
                await manageTokens()
        }
    } catch (error) {
        ui.prompt.log.error('Error managing token.')
        process.exit(0)
    }
}

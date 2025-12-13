import { state } from '../../../state'
import { ui } from '../../../ui'
import { manageToken } from './manage-token'
import { manageTokens } from '.'
import type { Token } from '../../../../core/types'
import { tokens } from '../../../tokens'

export async function deleteKey(keyToDelete: Token) {
    try {
        const confirmDelete = await ui.prompt.confirm({
            message: `Are you sure you want to delete ${ui.format.bold(
                keyToDelete.name
            )}?`,
        })
        if (ui.prompt.isCancel(confirmDelete) || !confirmDelete) {
            await manageToken(keyToDelete)
            return
        }

        state.tokens = state.tokens.filter((key) => key.id !== keyToDelete.id)

        await tokens.save()

        ui.prompt.log.success('✅ Key deleted!')
    } catch (error) {
        ui.prompt.log.error('Error deleting key.')
    } finally {
        return await manageTokens()
    }
}

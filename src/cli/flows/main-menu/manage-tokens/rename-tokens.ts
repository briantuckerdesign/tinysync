import { manageTokens } from '.'
import type { Token } from '../../../../core/types'
import { tokens } from '../../../tokens'
import { ui } from '../../../ui'
import { sanitizeString } from '../../../utils/sanitize-string'
import { manageToken } from './manage-token'

export async function renameToken(token: Token) {
    try {
        const newLabel = await ui.prompt.text({
            message: 'Enter a new label',
            initialValue: token.name,
        })

        if (ui.prompt.isCancel(newLabel)) {
            await manageToken(token)
            return
        }

        token.name = sanitizeString(newLabel)

        await tokens.save()

        ui.prompt.log.success('✅ Token renamed!')
    } catch (error) {
        ui.prompt.log.error('Error renaming token.')
    } finally {
        return await manageTokens()
    }
}

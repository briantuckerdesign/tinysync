import { encapsulateObjectForSelect } from '../../../utils/encapsulate-object-for-select'
import { state } from '../../../state'
import { ui } from '../../../ui'
import { createToken } from './create-tokens'
import { manageToken } from './manage-token'

export async function manageTokens() {
    try {
        ui.prompt.log.info(ui.format.bold('🔑 Manage access tokens'))

        const tokensToPickFrom = state.config.tokens

        // create name that equals label
        // `name` prop is required for clack, otherwise we'd just use `label`
        tokensToPickFrom.forEach((tokenToPick) => {
            tokenToPick.name = `${tokenToPick.label} [${tokenToPick.platform}]`
        })

        // TODO: create generic add new and back function, in addition to encapsulateObjectForSelect
        const tokensToSelect = encapsulateObjectForSelect(tokensToPickFrom)

        const createNewToken = {
            value: 'createNewToken',
            label: '+ Create new access token',
        }
        tokensToSelect.unshift(createNewToken)

        const backOption = { value: 'back', label: 'Back' }
        tokensToSelect.push(backOption)

        const selectedToken = (await ui.prompt.select({
            message: 'Select an access token',
            options: tokensToSelect,
        })) as any

        await ui.handleCancel(selectedToken)
        if (selectedToken === 'back') {
            return
        }

        if (selectedToken === 'createNewToken') {
            await createToken()
        } else {
            const token = state.config.tokens.find(
                (token) => token.id === selectedToken.id
            )
            if (!token) return
            await manageToken(token)
        }
    } catch (error) {
        ui.prompt.log.error('Error managing keys.')
        return
    }
}

/* -------------------------------------------------------------------------- */
/*                           Flows / Change password                          */
/* -------------------------------------------------------------------------- */
/**
 * 1. Ask user to confirm
 * 2. If no, return to main menu
 * 3. If yes, ask for new password
 * 4. Confirm new password
 * 5. If passwords do not match, return to step 3
 * 6. If passwords match, change password in config
 * 7. Save config using new password
 *
 */

import { ui } from '../../../ui'
import { configTools } from '../../../config-tools/index'
import { createPassword } from '../../login/create-password'
import { history } from '../../../history'

export async function changePassword() {
    history.add(changePassword)

    try {
        const confirmChange = await ui.prompt.confirm({
            message: 'Are you sure you want to change your password?',
        })

        await ui.handleCancel(confirmChange)

        if (confirmChange) {
            const success = await createPassword()
            if (!success) {
                ui.prompt.log.error('Error changing password.')
                await history.back()
                return
            } else {
                ui.prompt.log.success('Password changed!')
                await configTools.save()
                await history.back()
                return
            }
        }
    } catch (error) {
        ui.prompt.log.error('Error changing password.')
        await history.back()
        return
    }
}

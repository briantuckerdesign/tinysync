import { mainMenu } from '..'
import { tokens } from '../../../tokens'
import { ui } from '../../../ui'
import { createPassword } from '../../login/create-password'

export async function changePassword() {
    try {
        const confirmChange = await ui.prompt.confirm({
            message: 'Are you sure you want to change your password?',
        })

        await ui.handleCancel(confirmChange)

        if (confirmChange) {
            const success = await createPassword()
            if (!success) {
                ui.prompt.log.error('Error changing password.')
                await mainMenu()
                return
            } else {
                ui.prompt.log.success('Password changed!')
                await tokens.save()
                await mainMenu()
                return
            }
        }
    } catch (error) {
        ui.prompt.log.error('Error changing password.')
        await mainMenu()
        return
    }
}

import { ui } from '../../ui'
import { changePassword } from './change-password'
import { manageTokens } from './manage-tokens'
import { manageSyncs } from './manage-syncs'

export async function mainMenu() {
    try {
        ui.prompt.log.info(ui.format.bold('🏠 Menu'))

        const menu = await ui.prompt.select({
            message: 'What would you like to do?',
            options: [
                { value: 'viewSyncs', label: 'View syncs' },
                { value: 'manageTokens', label: 'Manage tokens' },
                { value: 'changePassword', label: 'Change password' },
                { value: 'exit', label: 'Exit', hint: 'Bye!' },
            ],
        })
        await ui.handleCancel(menu, () => {
            ui.prompt.outro('See ya later! 👋')
            process.exit(0)
        })

        switch (menu) {
            case 'viewSyncs':
                await manageSyncs()
                break
            case 'manageTokens':
                await manageTokens()
                break
            case 'changePassword':
                await changePassword()
                break
            default:
                ui.prompt.outro('See ya later! 👋')
                process.exit(0)
        }
    } catch (error) {
        ui.prompt.log.error('Error running main menu.')
        process.exit(0)
    }
}

import pack from '../package.json'
import { ui } from './ui'
import { login } from './flows/login'
import { mainMenu } from './flows/main-menu'
;(async () => {
    try {
        await ui.welcome()

        ui.prompt.intro(ui.format.dim(`tinysync CLI v${pack.version}`))

        await login()

        await mainMenu()

        ui.prompt.outro(`See ya later! 👋`)
    } catch (error) {
        ui.prompt.log.error('There was an error running tinysync CLI.')
        ui.prompt.log.error(error as string)
    }
})()

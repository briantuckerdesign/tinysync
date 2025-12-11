/* -------------------------------------------------------------------------- */
/*                                    Start                                   */
/* -------------------------------------------------------------------------- */
/**
 * 1. Initialize state & loader
 * 2. Display welcome message
 * 3. Attempt login flow
 * 4. If successful, begin main menu flow
 */

// TODO: Implement secure logging
// TODO: Error handling
// TODO: Allow folks to get go back in most steps, particularly when creating a sync

import pack from '../../package.json'
import { ui } from './ui'
// import { skip } from "./dev/skip";
import { login } from './flows/login'
import { mainMenu } from './flows/main-menu'
;(async () => {
    try {
        await ui.welcome()
        ui.prompt.intro(ui.format.dim(`tinySync v${pack.version}`))
        // await skip();
        await login()
        await mainMenu()
        ui.prompt.outro(`See ya later! 👋`)
    } catch (error) {
        ui.prompt.log.error('There was an error running tinySync.')
        ui.prompt.log.error(error as string)
    }
})()

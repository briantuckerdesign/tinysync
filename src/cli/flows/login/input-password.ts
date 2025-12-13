import { state } from '../../state'
import { ui } from '../../ui'
import { tokens } from '../../tokens'

export async function inputPassword(loadedConfig: any, repeat = false) {
    let password

    let message = 'Enter your password:'
    if (repeat) message = 'Incorrect password. Try again.'

    password = (await ui.prompt.password({
        message: message,
    })) as string
    await ui.handleCancel(password, () => {
        ui.prompt.outro('See ya later! 👋')
        process.exit(0)
    })

    try {
        state.tokens = await tokens.decrypt(loadedConfig, password)
        state.password = password
    } catch (error) {
        await inputPassword(loadedConfig, true)
    }
}

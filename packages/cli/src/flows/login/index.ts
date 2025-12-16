import { syncs } from '../../syncs'
import { tokens } from '../../tokens'
import { ui } from '../../ui'
import { createPassword } from './create-password'
import { inputPassword } from './input-password'

export async function login(): Promise<void> {
    ui.prompt.log.info(ui.format.bold('🔐 Login'))

    try {
        const tokenFile = await tokens.load()
        if (!tokenFile)
            throw new Error('There was an issue loading your token file.')

        if (tokenFile.encryptedData) {
            await inputPassword(tokenFile)
        } else {
            await createPassword()
            await tokens.save()
        }

        const syncsLoaded = await syncs.load()
        if (!syncsLoaded)
            throw new Error('There was an issue loading your syncs.')

        ui.prompt.log.success(ui.format.green('Success!'))
    } catch (error) {
        ui.prompt.log.error('There was an error logging in.')
        process.exit(0)
    }
}

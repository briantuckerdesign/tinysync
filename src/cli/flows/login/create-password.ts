import { state } from '../../state'
import { ui } from '../../ui'

export async function createPassword(repeat = false): Promise<boolean> {
    try {
        let message = 'Create a password:'

        if (repeat) message = "Passwords don't match. Try again."

        const password = (await ui.prompt.password({
            message: message,
        })) as string
        await ui.handleCancel(password, () => {
            process.exit(0)
        })

        message = 'Confirm password:'

        const confirmPassword = await ui.prompt.password({ message: message })
        await ui.handleCancel(confirmPassword, () => {
            process.exit(0)
        })

        // If passwords don't match, prompt user again
        if (password !== confirmPassword) {
            return await createPassword(true)
        } else {
            // If passwords match, set password in state
            state.password = password
            return true
        }
    } catch (error) {
        ui.prompt.log.error('Error creating password.')
        return false
    }
}

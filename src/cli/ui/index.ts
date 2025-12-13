import * as p from '@clack/prompts'
import f from 'picocolors'
import { welcomeMessage } from './welcome-message'
import { handleCancel } from './handle-cancel'

// Update the UI interface to include the additional spinner methods
interface UI {
    prompt: typeof p
    format: typeof f
    spinner: {
        start: (msg?: string) => void
        stop: (msg?: string) => void
        message: (msg: string) => void
    }
    welcome: () => Promise<void>
    handleCancel: <T = void>(
        prompt: any | symbol,
        destination?: () => Promise<T>,
        message?: string
    ) => Promise<T | undefined>
}

export const ui: UI = {
    prompt: p,
    format: f,
    spinner: (() => {
        const spinnerInstance = p.spinner() // Create a single spinner instance
        return {
            start: (msg?: string) => spinnerInstance.start(msg),
            stop: (msg?: string) => spinnerInstance.stop(msg),
            message: (msg: string) => spinnerInstance.message(msg),
        }
    })(),
    welcome: welcomeMessage,
    handleCancel,
}

import { ui } from '.'
import { mainMenu } from '../flows/main-menu'

export async function handleCancel<T = void>(
    prompt: any | symbol,
    destination?: () => Promise<T>,
    message: string = 'Operation cancelled.'
): Promise<T | undefined> {
    if (ui.prompt.isCancel(prompt)) {
        ui.prompt.cancel(message)
        return (await destination?.()) ?? (mainMenu() as Promise<T>)
    }
}

import { ui } from '.'
import { mainMenu } from '../flows/main-menu'

export async function handleCancel(
    prompt: any | symbol,
    destination: () => Promise<void> = mainMenu,
    message: string = 'Operation cancelled.'
) {
    if (ui.prompt.isCancel(prompt)) {
        ui.prompt.cancel(message)
        return await destination()
    }
}

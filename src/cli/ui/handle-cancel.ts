import { ui } from '.'

export async function handleCancel(
    prompt: any | symbol,
    destination: () => Promise<void>,
    message: string = 'Operation cancelled.'
) {
    if (ui.prompt.isCancel(prompt)) {
        ui.prompt.cancel(message)
        return await destination()
    }
}

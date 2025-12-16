import figlet from 'figlet'
import { ui } from '../ui'

export async function welcomeMessage(): Promise<void> {
    console.log(
        ui.format.green(
            figlet.textSync('tinysync', {
                font: 'Rectangles',
                horizontalLayout: 'default',
                verticalLayout: 'default',
                width: 80,
                whitespaceBreak: true,
            })
        )
    )

    console.log(ui.format.dim('\n        made with ❤️  by Brian\n'))
}

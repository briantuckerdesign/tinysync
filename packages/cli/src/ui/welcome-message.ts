import { ui } from '../ui'

export async function welcomeMessage(): Promise<void> {
    const ASCII_ART = `
 _   _                                  
| | (_)                                 
| |_ _ _ __  _   _ ___ _   _ _ __   ___ 
| __| | '_ \\| | | / __| | | | '_ \\ / __|
| |_| | | | | |_| \\__ \\ |_| | | | | (__ 
 \\__|_|_| |_|\\__, |___/\\__, |_| |_|\\___|
              __/ |     __/ |           
             |___/     |___/            `

    console.log(ui.format.green(ASCII_ART))

    console.log(ui.format.dim('\n          made with ❤️  by Brian\n'))
}

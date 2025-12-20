import anime from 'animejs'

const cli = `
 _   _
| | (_)
| |_ _ _ __  _   _ ___ _   _ _ __   ___
| __| | '_ \\| | | / __| | | | '_ \\ / __|
| |_| | | | | |_| \\__ \\ |_| | | | | (__
 \\__|_|_| |_|\\__, |___/\\__, |_| |_|\\___|
              __/ |     __/ |
             |___/     |___/
 
              
          made with ❤️  by Brian
 
 
┌  tinysync CLI
│
●  🔐 Login
│
◇  Enter your password:
│  ▪▪▪▪▪▪
│
◆  Success!
│
●  🏠 Menu
│
◆  What would you like to do?
│  ● View syncs
│  ○ Manage tokens
│  ○ Change password
│  ○ Exit
└
`

export function initTerminalAnimation() {
    const terminalContent = document.querySelector('#terminal .content')
    if (!terminalContent) return

    // Split into lines
    const lines = cli.split('\n')

    // Clear the content
    terminalContent.textContent = ''

    // Create a div for each line
    const lineElements: HTMLDivElement[] = []
    lines.forEach((line, index) => {
        const lineDiv = document.createElement('div')
        lineDiv.textContent = line
        lineDiv.style.opacity = '0'

        // Add green class to ASCII art lines (lines 1-8, accounting for the first empty line)
        if (index >= 1 && index <= 8) {
            lineDiv.classList.add('ascii-art')
        }

        terminalContent.appendChild(lineDiv)
        lineElements.push(lineDiv)
    })

    // Animate lines in sequence
    anime({
        targets: lineElements,
        opacity: [0, 1],
        translateY: [20, 0],
        delay: anime.stagger(100, { start: 500 }), // Start after 500ms, 100ms between each line
        duration: 300,
        easing: 'easeOutQuad',
    })
}

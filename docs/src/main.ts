import { initMatrixAnimation } from './matrix-anime'
import { initTerminalAnimation } from './terminal-animation'

// Initialize matrix animation
initMatrixAnimation()

// Initialize terminal animation
initTerminalAnimation()

// Show content once page is loaded
window.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container')
    if (container) {
        container.classList.add('loaded')
    }
})

import anime from 'animejs'

interface AnimationConfig {
    // Grid settings
    gridSize: number // Number of squares per row/column
    gap: number // Space between squares in pixels

    // Square appearance
    borderRadius: number // Corner radius in pixels
    baseOpacity: number // Base opacity of squares (0-1)

    // Animation settings
    duration: number // Animation duration in ms
    easing: string // Easing function
    delay: number // Base delay for animations in ms

    // Scale settings
    minScale: number // Minimum size of squares (0-1)
    maxScale: number // Maximum size of squares (0-1)

    // Opacity settings
    minOpacity: number // Minimum opacity during animation (0-1)
    maxOpacity: number // Maximum opacity during animation (0-1)

    // Color
    color: string // Base color (RGB format)

    // Wave stagger delays (higher = slower)
    staggerHorizontal: number // Delay for horizontal wave in ms
    staggerVertical: number // Delay for vertical wave in ms
    staggerRadial: number // Delay for radial wave in ms
}

const config: AnimationConfig = {
    // Grid settings
    gridSize: 100,
    gap: 16,

    // Square appearance
    borderRadius: 6,
    baseOpacity: 1,

    // Animation settings
    duration: 1000,
    easing: 'easeInOutSine',
    delay: 0,

    // Scale settings
    minScale: 0.05,
    maxScale: 0.3,

    // Opacity settings
    minOpacity: 0.5,
    maxOpacity: 1.0,

    // Color
    color: '58, 241, 21', // Lime green in RGB

    // Wave stagger delays
    staggerHorizontal: 100,
    staggerVertical: 100,
    staggerRadial: 100,
}

export function initMatrixAnimation(): void {
    const container = document.createElement('div')
    container.id = 'matrix-bg'
    document.body.insertBefore(container, document.body.firstChild)

    // Create the grid structure
    const cellSize =
        Math.max(window.innerWidth, window.innerHeight) / config.gridSize

    container.style.cssText = `
    display: grid;
    grid-template-columns: repeat(${config.gridSize}, ${cellSize}px);
    grid-template-rows: repeat(${config.gridSize}, ${cellSize}px);
    gap: ${config.gap}px;
    padding: ${config.gap}px;
  `

    const totalCells = config.gridSize * config.gridSize
    const cells: HTMLDivElement[] = []

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div')
        cell.className = 'matrix-cell'
        cell.style.cssText = `
      background-color: rgba(${config.color}, ${config.baseOpacity});
      border-radius: ${config.borderRadius}px;
      transform: scale(${config.minScale});
    `
        container.appendChild(cell)
        cells.push(cell)
    }

    function createWaveAnimation() {
        anime({
            targets: cells,
            scale: [
                {
                    value: config.maxScale * 0.6,
                    duration: config.duration * 0.75,
                },
                { value: config.minScale, duration: config.duration * 0.75 },
            ],
            delay: anime.stagger(config.staggerRadial, {
                grid: [config.gridSize, config.gridSize],
                from: 'first',
            }),
            easing: config.easing,
            loop: true,
        })
    }

    createWaveAnimation()

    let resizeTimeout: ReturnType<typeof setTimeout>
    function handleResize() {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
            const newCellSize =
                Math.max(window.innerWidth, window.innerHeight) /
                config.gridSize
            container.style.cssText = `
        display: grid;
        grid-template-columns: repeat(${config.gridSize}, ${newCellSize}px);
        grid-template-rows: repeat(${config.gridSize}, ${newCellSize}px);
        gap: ${config.gap}px;
        padding: ${config.gap}px;
      `
        }, 250)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        window.removeEventListener('resize', handleResize)
    })
}

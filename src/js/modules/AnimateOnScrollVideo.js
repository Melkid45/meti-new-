document.addEventListener('DOMContentLoaded', () => {
    const CONFIG = {
        squareSize: 40,
        gap: 0,
        fillColor: '#F4F4F403',
        bgColor: '#000000',
        batchSize: 50,
        fillSpeed: 0.5
    };

    // Initialize ScrollMagic controller
    const controller = new ScrollMagic.Controller();

    const canvas = document.getElementById('grid-canvas-video');
    const ctx = canvas.getContext('2d');
    let grid = [];
    let shuffledIndices = [];
    let lastProgress = 0;
    let filledCount = 0;

    function initGrid() {
        const container = document.querySelector('.showreel__video-wrapper');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        const cols = Math.ceil(canvas.width / (CONFIG.squareSize + CONFIG.gap));
        const rows = Math.ceil(canvas.height / (CONFIG.squareSize + CONFIG.gap));

        grid = Array(cols * rows).fill().map((_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            return {
                x: col * (CONFIG.squareSize + CONFIG.gap),
                y: row * (CONFIG.squareSize + CONFIG.gap),
                width: CONFIG.squareSize,
                height: CONFIG.squareSize,
                filled: false
            };
        });

        shuffledIndices = [...Array(grid.length).keys()].sort(() => Math.random() - 0.5);
        filledCount = 0;
        draw();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        grid.forEach(square => {
            ctx.fillStyle = square.filled ? CONFIG.fillColor : CONFIG.bgColor;
            ctx.fillRect(square.x, square.y, square.width, square.height);
        });
    }

    function updateGrid(progress) {
        const targetFilled = Math.floor(progress * grid.length * 2); // Multiply by 2 for two phases

        if (targetFilled <= grid.length) {
            const fillCount = Math.min(targetFilled, grid.length);
            for (let i = 0; i < fillCount; i++) {
                if (!grid[shuffledIndices[i]].filled) {
                    grid[shuffledIndices[i]].filled = true;
                }
            }
            for (let i = fillCount; i < grid.length; i++) {
                grid[shuffledIndices[i]].filled = false;
            }
        } else {
            const clearCount = Math.min(targetFilled - grid.length, grid.length);
            for (let i = 0; i < clearCount; i++) {
                if (grid[shuffledIndices[grid.length - 1 - i]].filled) {
                    grid[shuffledIndices[grid.length - 1 - i]].filled = false;
                }
            }
            for (let i = clearCount; i < grid.length; i++) {
                grid[shuffledIndices[grid.length - 1 - i]].filled = true;
            }
        }

        draw();
    }

    // Create ScrollMagic scene
    new ScrollMagic.Scene({
        triggerElement: ".showreel__video-wrapper",
        duration: "400%",
        triggerHook: 0
    })
    .setPin(".showreel__video-wrapper")
    .on("progress", function(event) {
        updateGrid(event.progress);
    })
    .addTo(controller)
    initGrid();
    window.addEventListener('resize', () => {
        initGrid();
        controller.update();
    });
});
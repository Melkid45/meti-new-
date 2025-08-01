class InteractiveGrid {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        // Настройки сетки
        this.settings = {
            cellSize: 40,
            spacing: 0,
            activationRadius: 80,
            fadeSpeed: 0.05,
            baseColor: { r: 244, g: 244, b: 244, a: 0.3 },
            blurAmount: 40,
            blurSteps: 3
        };

        // Состояние
        this.cells = [];
        this.mouse = { x: -1000, y: -1000 };
        this.animationId = null;
        this.resizeObserver = null;

        this.init();
    }
    applyStrongBlur() {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');

        // Многослойное размытие
        let blur = this.settings.blurAmount / this.settings.blurSteps;

        for (let i = 0; i < this.settings.blurSteps; i++) {
            tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.filter = `backdrop-filter: blur(${blur}px)`;
            tempCtx.drawImage(this.canvas, 0, 0);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(tempCanvas, 0, 0);
        }
    }

    init() {
        this.setupCanvas();
        this.createGrid();
        this.setupEvents();
        this.startAnimation();
    }

    setupCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        // Создаем эффект размытия для контекста
        this.ctx.filter = `blur(px)backdrop-filter: blur(${this.settings.blurAmount}px)`;
    }

    createGrid() {
        this.cells = [];

        const cols = Math.ceil(this.canvas.width / (this.settings.cellSize + this.settings.spacing));
        const rows = Math.ceil(this.canvas.height / (this.settings.cellSize + this.settings.spacing));

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                this.cells.push({
                    x: x * (this.settings.cellSize + this.settings.spacing),
                    y: y * (this.settings.cellSize + this.settings.spacing),
                    size: this.settings.cellSize,
                    alpha: 0,
                    lastActive: 0
                });
            }
        }
    }

    setupEvents() {
        const section = this.canvas.closest('.case-card__media');

        section.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        section.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });

        this.resizeObserver = new ResizeObserver(() => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
            this.createGrid();
        });
        this.resizeObserver.observe(this.canvas);
    }

    updateCells() {
        const now = Date.now();
        const activationRadiusSq = this.settings.activationRadius ** 2;

        this.cells.forEach(cell => {
            const dx = this.mouse.x - (cell.x + cell.size / 2);
            const dy = this.mouse.y - (cell.y + cell.size / 2);
            const distanceSq = dx * dx + dy * dy;

            if (distanceSq < activationRadiusSq) {
                cell.alpha = Math.min(1, cell.alpha + this.settings.fadeSpeed);
                cell.lastActive = now;
            } else {
                cell.alpha = Math.max(0, cell.alpha - this.settings.fadeSpeed * 0.3);
            }

        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.cells.forEach(cell => {
            if (cell.alpha <= 0) return;

            this.ctx.save();
            this.ctx.translate(
                cell.x + cell.size / 2,
                cell.y + cell.size / 2
            );

            this.ctx.fillStyle = `rgba(
                ${this.settings.baseColor.r},
                ${this.settings.baseColor.g},
                ${this.settings.baseColor.b},
                ${this.settings.baseColor.a * cell.alpha}
            )`;

            this.ctx.fillRect(
                -cell.size / 2,
                -cell.size / 2,
                cell.size,
                cell.size
            );

            this.ctx.restore();
        });
        this.applyStrongBlur();
    }

    animate() {
        this.updateCells();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    startAnimation() {
        if (!this.animationId) {
            this.animate();
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const canvases = document.querySelectorAll('.grid-canvas');

    canvases.forEach(canvas => {
        if (canvas) {
            new InteractiveGrid(canvas);
        }
    });
});

// Анимация Скролла

import { gsap, ScrollTrigger } from './ScrollTriggerInit.js';
gsap.ticker.lagSmoothing(0);
ScrollTrigger.normalizeScroll(true);


document.addEventListener('DOMContentLoaded', () => {
    // Инициализация контроллера ScrollMagic
    const controller = new ScrollMagic.Controller();

    // Получаем все секции
    const wraps = document.querySelectorAll('.portfolio__list .wrap');

    // Создаем сцену для каждой секции
    wraps.forEach((wrap, index) => {
        new ScrollMagic.Scene({
            triggerElement: '.portfolio',
            triggerHook: 0,
            duration: '100%', // Длина анимации для каждой секции
            offset: index * window.innerHeight // Смещение для каждой следующей секции
        })
            .setTween(
                gsap.fromTo(wrap,
                    { y: '100%' },
                    {
                        y: '-140%',
                        duration: 1,
                        ease: "power2.out"
                    }
                )
            )
            .setPin('.portfolio')
            .addTo(controller)
    });
});
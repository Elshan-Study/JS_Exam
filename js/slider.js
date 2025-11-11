class Slider {
    constructor(selector, opts = {}) {
        this.root = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!this.root) return;
        this.track = this.root.querySelector('.slides');
        this.slides = Array.from(this.track.children);
        this.total = this.slides.length;
        this.index = 0;
        this.prevBtn = this.root.querySelector('.prev');
        this.nextBtn = this.root.querySelector('.next');
        this.dotsWrap = this.root.querySelector('.dots');
        this.timer = null;
        this.interval = opts.interval || 4500;
        this.init();
    }

    init() {
        this.updateSize();
        window.addEventListener('resize', () => this.updateSize());

        this.buildDots();

        this.prevBtn?.addEventListener('click', () => this.move(-1));
        this.nextBtn?.addEventListener('click', () => this.move(1));

        this.root.addEventListener('mouseenter', () => this.stop());
        this.root.addEventListener('mouseleave', () => this.start());

        this.root.tabIndex = 0;
        this.root.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.move(-1);
            if (e.key === 'ArrowRight') this.move(1);
        });

        this.start();
        this.update();
    }

    updateSize() {
        this.track.style.transform = `translateX(-${this.index * 100}%)`;
    }

    buildDots() {
        if (!this.dotsWrap) return;
        this.dotsWrap.innerHTML = '';
        this.dots = [];
        for (let i = 0; i < this.total; i++) {
            const b = document.createElement('button');
            b.setAttribute('aria-label', `Go to slide ${i+1}`);
            b.addEventListener('click', () => { this.index = i; this.update(); });
            this.dotsWrap.appendChild(b);
            this.dots.push(b);
        }
    }

    move(dir) {
        this.index = (this.index + dir + this.total) % this.total;
        this.update();
    }

    update() {
        this.track.style.transform = `translateX(-${this.index * 100}%)`;
        if (this.dots && this.dots.length) this.dots.forEach((d, i) => d.classList.toggle('active', i === this.index));
    }

    start() {
        this.stop();
        this.timer = setInterval(() => this.move(1), this.interval);
    }

    stop() {
        if (this.timer) { clearInterval(this.timer); this.timer = null; }
    }
}

window.Slider = Slider;

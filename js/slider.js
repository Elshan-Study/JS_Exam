class Slider {
    constructor(selector){
        this.root = document.querySelector(selector);
        if (!this.root) return;
        this.track = this.root.querySelector('.slides');
        this.slides = this.root.querySelectorAll('.slide');
        this.total = this.slides.length;
        this.index = 0;
        this.prevBtn = this.root.querySelector('.prev');
        this.nextBtn = this.root.querySelector('.next');
        this.dotsWrap = this.root.querySelector('.dots');
        this.timer = null;
        this.init();
    }
    init(){
        this.createDots();
        this.update();
        this.prevBtn?.addEventListener('click', ()=>this.move(-1));
        this.nextBtn?.addEventListener('click', ()=>this.move(1));
        this.root.addEventListener('mouseenter', ()=>this.stop());
        this.root.addEventListener('mouseleave', ()=>this.start());
        this.start();
    }
    createDots(){
        this.dots = [];
        for (let i=0;i<this.total;i++){
            const b = document.createElement('button');
            b.addEventListener('click', ()=>{ this.index = i; this.update(); });
            this.dotsWrap.appendChild(b);
            this.dots.push(b);
        }
    }
    move(dir){
        this.index = (this.index + dir + this.total) % this.total;
        this.update();
    }
    update(){
        this.track.style.transform = `translateX(-${this.index * 100}%)`;
        this.dots.forEach((d,i)=> d.style.opacity = i===this.index ? '1' : '.4');
    }
    start(){ this.stop(); this.timer = setInterval(()=>this.move(1), 4500); }
    stop(){ if (this.timer) clearInterval(this.timer); this.timer = null; }
}
window.Slider = Slider;

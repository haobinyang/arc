export class FPS{
    constructor(canvas){
        this.currentTime = 0;
        this.lastTime = 0;
        this._fps = 0;
        this.fps = 0;

        let id = 'fps_' + Date.now() + '_' + parseInt(Math.random() * 1000);
        this.fpsEl = document.querySelector('#' + id);
        if(!this.fpsEl){
            this.fpsEl = document.createElement('div');
            this.fpsEl.style.cssText = 'color: cyan; position: fixed; padding: 10px; font-size: 12px;';
            this.fpsEl.innerText = 'FPS: ' + this.fps;
            canvas.parentNode.insertBefore(this.fpsEl, canvas);
        }
    }

    start(){
        this.currentTime = 0;
        this.lastTime = Date.now();
    }

    update(){
        this.currentTime = Date.now();
        this._fps++;

        if(this.currentTime - this.lastTime >= 1000){ // update per second
            this.fps = this._fps;
            this._fps = 0;
            this.lastTime = this.currentTime;
            this.fpsEl.innerText = 'FPS: ' + this.fps;
        }
    }
}